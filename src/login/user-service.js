// login/user-service.js
import { db, collection, addDoc, query, orderBy, limit, getDocs, serverTimestamp } from './firebase-config.js';
import { getUsuarioAtual, atualizarPerfil } from './auth.js';

export async function salvarPlanoGerado(dadosPlano) {
    const user = getUsuarioAtual();
    if (!user) throw new Error("Usuário não autenticado");
    const planosRef = collection(db, "usuarios", user.uid, "planos");
    await addDoc(planosRef, { ...dadosPlano, dataGeracao: serverTimestamp() });
}

export async function getHistoricoPlanos(limite = 50) {
    const user = getUsuarioAtual();
    if (!user) return [];
    const planosRef = collection(db, "usuarios", user.uid, "planos");
    const q = query(planosRef, orderBy("dataGeracao", "desc"), limit(limite));
    const snapshot = await getDocs(q);
    const historico = [];
    snapshot.forEach(doc => {
        const data = doc.data();
        historico.push({
            id: doc.id,
            titulo: data.titulo || 'Plano',
            disciplina: data.disciplina || '',
            classe: data.classe || '',
            tipo: data.tipo || 'Plano de Aula',
            data: data.dataGeracao?.toDate?.() || new Date()
        });
    });
    return historico;
}

export async function salvarPerfil(dados) {
    return await atualizarPerfil(dados);
}

export async function carregarPerfil() {
    const { getDadosExibicao } = await import('./auth.js');
    return getDadosExibicao();
}

// Funções de anúncios (proxy)
export async function incrementarVisitas(uid) {
    const { incrementarVisitas } = await import('./auth.js');
    return incrementarVisitas(uid);
}
export async function setFacebookSeguido(uid) {
    const { setFacebookSeguido } = await import('./auth.js');
    return setFacebookSeguido(uid);
}
export async function setYoutubeInscrito(uid) {
    const { setYoutubeInscrito } = await import('./auth.js');
    return setYoutubeInscrito(uid);
}
