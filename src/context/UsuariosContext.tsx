import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Usuario } from '../types';
import { mockUsuarios } from '../data/mockData';

// v2: versão da chave bumped de propósito — o formato de Usuario mudou (papel
// admin/gestor/operador_campo, login em vez de e-mail) e dispositivos com o
// mock antigo salvo (analista/operario, ou usuários joao/maria/carlos) não
// devem continuar usando esse dado obsoleto.
const STORAGE_KEY = '@motiva:usuarios:v2';

// Migra dado salvo antes de `equipeId` (única equipe) virar `equipeIds`
// (várias equipes por Operador de Campo) — sem isso, um usuário salvo com o
// formato antigo perderia o vínculo com a equipe dele (equipeIds ficaria
// undefined). Não bumped a versão da chave pra isso: diferente da mudança de
// v1→v2, aqui não há perda de informação, só precisa ser traduzida.
function comEquipeIds(u: Usuario & { equipeId?: string }): Usuario {
  if (Array.isArray(u.equipeIds)) return u;
  const { equipeId, ...resto } = u;
  return { ...resto, equipeIds: equipeId ? [equipeId] : [] };
}

type UsuariosContextType = {
  usuarios: Usuario[];
  adicionarUsuario: (dados: Omit<Usuario, 'id'>) => boolean;
  editarUsuario: (id: number, dados: Omit<Usuario, 'id'>) => boolean;
  removerUsuario: (id: number) => void;
  /** Única fonte de verificação de credenciais — usada pelo AuthContext.login(). */
  buscarPorCredenciais: (usuario: string, senha: string) => Usuario | undefined;
  /** Remove uma equipe de `equipeIds` de qualquer usuário que apontava pra ela
   *  (sem mexer nas outras equipes que ele já tinha) — chamado ao excluir uma
   *  equipe, pra nenhum Operador de Campo ficar com um vínculo pra uma equipe
   *  que não existe mais (ver EquipesScreen.confirmarDelete). */
  desvincularEquipe: (equipeId: string) => void;
};

const UsuariosContext = createContext<UsuariosContextType | null>(null);

export function UsuariosProvider({ children }: { children: ReactNode }) {
  const [usuarios, setUsuarios] = useState<Usuario[]>(mockUsuarios);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function carregar() {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw) as Usuario[];
        if (Array.isArray(parsed) && parsed.length > 0 && !ignore) {
          setUsuarios(parsed.map(comEquipeIds));
        }
      } catch {
        // ignora erro e mantém o seed de mockUsuarios
      } finally {
        if (!ignore) setIsHydrated(true);
      }
    }

    void carregar();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(usuarios)).catch(() => undefined);
  }, [usuarios, isHydrated]);

  function adicionarUsuario(dados: Omit<Usuario, 'id'>): boolean {
    const jaExiste = usuarios.some((u) => u.usuario.toLowerCase() === dados.usuario.toLowerCase());
    if (jaExiste) return false;
    const novoId = usuarios.length > 0 ? Math.max(...usuarios.map((u) => u.id)) + 1 : 1;
    setUsuarios((prev) => [...prev, { ...dados, id: novoId }]);
    return true;
  }

  function editarUsuario(id: number, dados: Omit<Usuario, 'id'>): boolean {
    const duplicado = usuarios.some(
      (u) => u.id !== id && u.usuario.toLowerCase() === dados.usuario.toLowerCase(),
    );
    if (duplicado) return false;
    setUsuarios((prev) => prev.map((u) => (u.id === id ? { ...u, ...dados } : u)));
    return true;
  }

  function removerUsuario(id: number) {
    setUsuarios((prev) => prev.filter((u) => u.id !== id));
  }

  function buscarPorCredenciais(usuarioDigitado: string, senha: string): Usuario | undefined {
    return usuarios.find((u) => u.usuario === usuarioDigitado && u.senha === senha);
  }

  function desvincularEquipe(equipeId: string) {
    setUsuarios((prev) => prev.map((u) =>
      u.equipeIds?.includes(equipeId) ? { ...u, equipeIds: u.equipeIds.filter((id) => id !== equipeId) } : u,
    ));
  }

  return (
    <UsuariosContext.Provider
      value={{ usuarios, adicionarUsuario, editarUsuario, removerUsuario, buscarPorCredenciais, desvincularEquipe }}
    >
      {children}
    </UsuariosContext.Provider>
  );
}

export function useUsuarios() {
  const ctx = useContext(UsuariosContext);
  if (!ctx) throw new Error('useUsuarios deve ser usado dentro de UsuariosProvider');
  return ctx;
}
