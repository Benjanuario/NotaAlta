// src/firestore-service.js
import { 
    db, 
    collection, 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc, 
    addDoc,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    serverTimestamp,
    deleteDoc
} from './firebase-config.js';
import { getUsuarioAtual, getUsuarioData } from './auth.js';

// ============================================
// PLANOS GERADOS (HISTÓRICO)
// ============================================

export async function salvarPlanoGerado(dadosPlano) {
    const user = getUsuarioAtual();
    if (!user) throw new Error("Usuário não autenticado");
    
    const planosRef = collection(db, "usuarios", user.uid, "planos");
    
    const docRef = await addDoc(planosRef, {
        ...dadosPlano,
        dataGeracao: serverTimestamp(),
        uid: user.uid
    });
    
    // Também salvar no localStorage como cache
    const historico = JSON.parse(localStorage.getItem('historicoPlanos') || '[]');
    historico.unshift({
        id: docRef.id,
        ...dadosPlano,
        data: new Date().toISOString()
    });
    // Manter apenas os últimos 50
    if (historico.length > 50) historico.pop();
    localStorage.setItem('historicoPlanos', JSON.stringify(historico));
    
    return docRef.id;
}

export async function getHistoricoPlanos(limiteMax = 50) {
    const user = getUsuarioAtual();
    if (!user) return [];
    
    try {
        const planosRef = collection(db, "usuarios", user.uid, "planos");
        const q = query(planosRef, orderBy("dataGeracao", "desc"), limit(limiteMax));
        const querySnapshot = await getDocs(q);
        
        const historico = [];
        querySnapshot.forEach((doc) => {
            historico.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return historico;
    } catch (error) {
        console.error("Erro ao buscar histórico:", error);
        // Fallback para localStorage
        return JSON.parse(localStorage.getItem('historicoPlanos') || '[]');
    }
}

// ============================================
// TRANSAÇÕES (CRÉDITOS)
// ============================================

export async function registrarTransacao(tipo, quantidade, descricao) {
    const user = getUsuarioAtual();
    if (!user) throw new Error("Usuário não autenticado");
    
    const transacoesRef = collection(db, "usuarios", user.uid, "transacoes");
    
    await addDoc(transacoesRef, {
        tipo: tipo, // 'credito' ou 'consumo'
        quantidade: quantidade,
        descricao: descricao,
        data: serverTimestamp()
    });
}

export async function getTransacoes(limiteMax = 50) {
    const user = getUsuarioAtual();
    if (!user) return [];
    
    const transacoesRef = collection(db, "usuarios", user.uid, "transacoes");
    const q = query(transacoesRef, orderBy("data", "desc"), limit(limiteMax));
    const querySnapshot = await getDocs(q);
    
    const transacoes = [];
    querySnapshot.forEach((doc) => {
        transacoes.push({
            id: doc.id,
            ...doc.data()
        });
    });
    
    return transacoes;
}
