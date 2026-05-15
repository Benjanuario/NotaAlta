// login/auth.js
import { auth, db, onAuthStateChanged, signOut, doc, getDoc, setDoc, updateDoc, serverTimestamp } from './firebase-config.js';

let usuarioAtual = null;
let usuarioData = null;

export async function verificarAutenticacao() {
    return new Promise((resolve) => {
        if (usuarioAtual && usuarioData) {
            resolve({ user: usuarioAtual, data: usuarioData });
            return;
        }
        
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                usuarioAtual = user;
                const userRef = doc(db, "usuarios", user.uid);
                const userDoc = await getDoc(userRef);
                
                if (!userDoc.exists()) {
                    usuarioData = {
                        uid: user.uid,
                        email: user.email,
                        nome: user.displayName || user.email?.split('@')[0],
                        fotoURL: user.photoURL || null,
                        dataCadastro: serverTimestamp(),
                        ultimoAcesso: serverTimestamp(),
                        telefone: null,
                        provincia: null,
                        distrito: null,
                        escola: null,
                        totalVisitas: 1,
                        facebookSeguido: false,
                        youtubeInscrito: false,
                        facebookClickSession: null
                    };
                    await setDoc(userRef, usuarioData);
                } else {
                    usuarioData = userDoc.data();
                    await updateDoc(userRef, { ultimoAcesso: serverTimestamp() });
                }
                resolve({ user: usuarioAtual, data: usuarioData });
            } else {
                const paginaAtual = window.location.pathname.split('/').pop();
                if (paginaAtual === 'dashbord.html' || paginaAtual === '') {
                    localStorage.setItem('paginaDestino', 'dashbord.html');
                    window.location.href = 'index.html';
                }
                resolve(null);
            }
        });
    });
}

export function getUsuarioAtual() { return usuarioAtual; }
export function getUsuarioData() { return usuarioData; }

export function getDadosExibicao() {
    if (!usuarioAtual) return null;
    return {
        nome: usuarioData?.nome || usuarioAtual.displayName || 'Professor',
        email: usuarioAtual.email,
        fotoURL: usuarioAtual.photoURL,
        primeiroNome: (usuarioData?.nome || usuarioAtual.displayName || '').split(' ')[0] || 'Professor',
        uid: usuarioAtual.uid,
        telefone: usuarioData?.telefone || '',
        provincia: usuarioData?.provincia || '',
        distrito: usuarioData?.distrito || '',
        escola: usuarioData?.escola || '',
        totalVisitas: usuarioData?.totalVisitas || 1,
        facebookSeguido: usuarioData?.facebookSeguido || false,
        youtubeInscrito: usuarioData?.youtubeInscrito || false,
        facebookClickSession: usuarioData?.facebookClickSession || null
    };
}

export async function fazerLogout() {
    usuarioAtual = null;
    usuarioData = null;
    await signOut(auth);
    localStorage.clear();
    window.location.href = 'index.html';
}

export async function atualizarPerfil(dados) {
    if (!usuarioAtual) throw new Error("Não autenticado");
    const userRef = doc(db, "usuarios", usuarioAtual.uid);
    await updateDoc(userRef, {
        nome: dados.nome,
        provincia: dados.provincia,
        distrito: dados.distrito,
        escola: dados.escola,
        telefone: dados.telefone,
        perfilAtualizado: serverTimestamp()
    });
    usuarioData = { ...usuarioData, ...dados };
    return true;
}

// ===== Funções para anúncios =====
export async function incrementarVisitas(uid) {
    if (!uid) return 0;
    const userRef = doc(db, "usuarios", uid);
    const userDoc = await getDoc(userRef);
    const visitasAtuais = (userDoc.data()?.totalVisitas || 0) + 1;
    await updateDoc(userRef, { totalVisitas: visitasAtuais });
    if (usuarioAtual && usuarioAtual.uid === uid && usuarioData) {
        usuarioData.totalVisitas = visitasAtuais;
    }
    return visitasAtuais;
}

export async function setFacebookSeguido(uid) {
    if (!uid) return;
    const userRef = doc(db, "usuarios", uid);
    const userDoc = await getDoc(userRef);
    const visitasAtuais = userDoc.data()?.totalVisitas || 1;
    await updateDoc(userRef, {
        facebookSeguido: true,
        facebookClickSession: visitasAtuais
    });
    if (usuarioAtual && usuarioAtual.uid === uid && usuarioData) {
        usuarioData.facebookSeguido = true;
        usuarioData.facebookClickSession = visitasAtuais;
    }
}

export async function setYoutubeInscrito(uid) {
    if (!uid) return;
    const userRef = doc(db, "usuarios", uid);
    await updateDoc(userRef, { youtubeInscrito: true });
    if (usuarioAtual && usuarioAtual.uid === uid && usuarioData) {
        usuarioData.youtubeInscrito = true;
    }
}
// ============================================
// FUNÇÕES DE CRÉDITOS (PERSISTENTES NO FIRESTORE)
// ============================================

const CREDITS_CONFIG = {
    welcomeCredits: 3,
    weeklyCredits: 2,
    maxCredits: 20,
    purchaseValidityDays: 30,
    packages: [
        { id: 'pack1', price: 4, credits: 1, name: '1 Acesso' },
        { id: 'pack2', price: 10, credits: 3, name: '3 Acessos' },
        { id: 'pack3', price: 20, credits: 6, name: '6 Acessos' },
        { id: 'pack4', price: 30, credits: 10, name: '10 Acessos' },
        { id: 'pack5', price: 50, credits: 20, name: '20 Acessos' }
    ]
};

export async function getCreditosUsuario(uid) {
    if (!uid) return null;
    const userRef = doc(db, "usuarios", uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
        // Criar usuário com créditos iniciais
        const creditosData = {
            welcome: CREDITS_CONFIG.welcomeCredits,
            weekly: CREDITS_CONFIG.weeklyCredits,
            purchased: 0,
            purchaseExpiry: null,
            lastWeeklyReset: serverTimestamp(),
            total: CREDITS_CONFIG.welcomeCredits + CREDITS_CONFIG.weeklyCredits
        };
        await updateDoc(userRef, { creditos: creditosData });
        return creditosData;
    }
    
    const data = userDoc.data();
    return data.creditos || {
        welcome: 0, weekly: 0, purchased: 0, purchaseExpiry: null, lastWeeklyReset: null, total: 0
    };
}

export async function atualizarCreditos(uid, novosCreditos) {
    if (!uid) return false;
    const userRef = doc(db, "usuarios", uid);
    await updateDoc(userRef, { creditos: novosCreditos });
    if (usuarioAtual && usuarioAtual.uid === uid && usuarioData) {
        usuarioData.creditos = novosCreditos;
    }
    return true;
}

export async function verificarResetSemanal(uid) {
    if (!uid) return false;
    const creditos = await getCreditosUsuario(uid);
    const hoje = new Date();
    const ultimoReset = creditos.lastWeeklyReset?.toDate?.() || null;
    
    const inicioSemanaAtual = new Date(hoje);
    inicioSemanaAtual.setDate(hoje.getDate() - hoje.getDay() + 1);
    inicioSemanaAtual.setHours(0, 0, 0, 0);
    
    if (!ultimoReset || ultimoReset < inicioSemanaAtual) {
        creditos.weekly = CREDITS_CONFIG.weeklyCredits;
        creditos.lastWeeklyReset = serverTimestamp();
        creditos.total = (creditos.welcome || 0) + creditos.weekly + (creditos.purchased || 0);
        await atualizarCreditos(uid, creditos);
        return true;
    }
    return false;
}

export async function adicionarCreditosComprados(uid, creditsAmount) {
    if (!uid) return false;
    const creditos = await getCreditosUsuario(uid);
    const novoTotal = (creditos.purchased || 0) + creditsAmount;
    
    if (novoTotal > CREDITS_CONFIG.maxCredits) return false;
    
    creditos.purchased = novoTotal;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + CREDITS_CONFIG.purchaseValidityDays);
    creditos.purchaseExpiry = Timestamp.fromDate(expiryDate);
    creditos.total = (creditos.welcome || 0) + (creditos.weekly || 0) + creditos.purchased;
    
    await atualizarCreditos(uid, creditos);
    return true;
}

export async function consumirCredito(uid) {
    if (!uid) return { success: false, message: 'Usuário não autenticado' };
    
    await verificarResetSemanal(uid);
    const creditos = await getCreditosUsuario(uid);
    const total = creditos.total || 0;
    
    if (total <= 0) {
        return { success: false, message: '❌ Você não tem acessos disponíveis.' };
    }
    
    if (creditos.welcome > 0) {
        creditos.welcome--;
    } else if (creditos.weekly > 0) {
        creditos.weekly--;
    } else if (creditos.purchased > 0) {
        creditos.purchased--;
    }
    
    creditos.total = (creditos.welcome || 0) + (creditos.weekly || 0) + (creditos.purchased || 0);
    await atualizarCreditos(uid, creditos);
    
    // Registrar consumo na subcoleção
    const transRef = collection(db, "usuarios", uid, "transacoes");
    await addDoc(transRef, {
        tipo: 'consumo',
        quantidade: 1,
        data: serverTimestamp(),
        saldo_restante: creditos.total
    });
    
    return { success: true, remaining: creditos.total };
}

export async function registrarCompraCredito(uid, packageId, creditsAmount, valor, metodo, referencia) {
    if (!uid) return false;
    
    // Registrar transação
    const transRef = collection(db, "usuarios", uid, "transacoes");
    await addDoc(transRef, {
        tipo: 'compra',
        packageId: packageId,
        quantidade: creditsAmount,
        valor: valor,
        metodo: metodo,
        referencia: referencia,
        status: 'confirmado',
        data: serverTimestamp()
    });
    
    // Adicionar créditos
    return await adicionarCreditosComprados(uid, creditsAmount);
}

export function getCreditosConfig() {
    return CREDITS_CONFIG;
}
