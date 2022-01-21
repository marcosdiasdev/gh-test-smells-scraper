export default class Documento {
  id: number;
  titulo: string;
  conteudo: string;

  constructor(id: number, titulo: string, conteudo: string) {
    this.id = id;
    this.titulo = titulo;
    this.conteudo = conteudo;
  }
}
