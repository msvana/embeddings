import { mistralEmbeddings } from "../Embeddings";
import * as TSNE from "@/model/TSNE";

const texts = ["A", "A", "B", "B", "C", "D", "D", "E"];
const embeddings = await mistralEmbeddings(texts, "HjhXGAyXrTmULYgCVuqEtBJ8XDezA40W")
const embeddingsTSNE = TSNE.transform(embeddings, 2);

console.log(embeddingsTSNE);

