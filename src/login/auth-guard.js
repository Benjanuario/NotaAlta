// src/auth-guard.js
import { 
    auth, 
    onAuthStateChanged, 
    signOut, 
    db, 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc,
    serverTimestamp 
} from './firebase-config.js';

let usuarioAtual = null;
let usuarioDataCompleta = null;

export async function verificarAutenticacao() {
    return new Promise((resolve) => {
        if (usuarioAtual && usuarioDataCompleta) {
            resolve({ user: usuarioAtual, data: usuarioDataCompleta });
            return;
        }
        
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                usuarioAtual = user;
                
                // Buscar ou criar dados do usuário no Firestore
                const userRef = doc(db, "usuarios", user.uid);
                const userDoc = await getDoc(userRef);
                
                if (!userDoc.exists()) {
                    // Primeiro acesso - criar registro básico
                    usuarioDataCompleta = {
                        uid: user.uid,
                        email: user.email,
                        nome: user.displayName || user.email?.split('@')[0],
                        fotoURL: user.photoURL || null,
                        dataCadastro: serverTimestamp(),
                        ultimoAcesso: serverTimestamp(),
                        creditos: 0,
                        planosGerados: 0
                    };
                    await setDoc(userRef, usuarioDataCompleta);
                } else {
                    usuarioDataCompleta = userDoc.data();
                    // Atualizar último acesso
                    await updateDoc(userRef, {
                        ultimoAcesso: serverTimestamp()
                    });
                }
                
                resolve({ user: usuarioAtual, data: usuarioDataCompleta });
            } else {
                // Usuário não autenticado - redirecionar para login
                const paginaAtual = window.location.pathname.split('/').pop();
                const paginasProtegidas = ['dashbord.html', 'planos.html', 'pagamentos.html', 'perfil.html', 'doar.html'];
                
                if (paginasProtegidas.includes(paginaAtual) || paginaAtual === '') {
                    localStorage.setItem('paginaDestino', paginaAtual || 'dashbord.html');
                    window.location.href = 'index.html';
                }
                resolve(null);
            }
        });
    });
}

export function getUsuarioAtual() {
    return usuarioAtual;
}

export function getUsuarioData() {
    return usuarioDataCompleta;
}

export async function fazerLogout() {
    usuarioAtual = null;
    usuarioDataCompleta = null;
    await signOut(auth);
    localStorage.removeItem('dadosUsuario'); // Limpar cache local
    window.location.href = 'index.html';
}

export function getDadosExibicao() {
    if (!usuarioAtual) return null;
    return {
        nome: usuarioDataCompleta?.nome || usuarioAtual.displayName,
        email: usuarioAtual.email,
        fotoURL: usuarioAtual.photoURL,
        primeiroNome: (usuarioDataCompleta?.nome || usuarioAtual.displayName || '').split(' ')[0] || 'Professor',
        uid: usuarioAtual.uid,
        creditos: usuarioDataCompleta?.creditos || 0,
        planosGerados: usuarioDataCompleta?.planosGerados || 0
    };
}

export async function atualizarPerfil(dadosPerfil) {
    if (!usuarioAtual) return false;
    
    const userRef = doc(db, "usuarios", usuarioAtual.uid);
    await updateDoc(userRef, {
        nome: dadosPerfil.nome,
        provincia: dadosPerfil.provincia,
        distrito: dadosPerfil.distrito,
        escola: dadosPerfil.escola,
        telefone: dadosPerfil.telefone,
        perfilAtualizado: serverTimestamp()
    });
    
    // Atualizar dados locais
    usuarioDataCompleta = { ...usuarioDataCompleta, ...dadosPerfil };
    return true;
}
