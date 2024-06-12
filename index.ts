import axios from "axios";
import cheerio from "cheerio";
import fs from "fs";

// Interface para representar os recursos extraídos
interface Recursos {
  html: string;
  css: string[];
  js: string[];
}

// Função para extrair recursos de uma URL
async function extrairRecursos(url: string): Promise<Recursos | null> {
  try {
    const response = await axios.get(url);
    const html = response.data;

    // Use cheerio para analisar o HTML
    const $ = cheerio.load(html);

    // Extrair o CSS
    const css: string[] = [];
    $('link[rel="stylesheet"]').each((index, element) => {
      css.push($(element).attr("href") || "");
    });

    // Extrair o JS
    const js: string[] = [];
    $("script").each((index, element) => {
      js.push($(element).attr("src") || "");
    });

    return { html, css, js };
  } catch (error) {
    console.error("Erro ao extrair recursos:", error);
    return null;
  }
}

// Função para salvar conteúdo em um arquivo
function salvarArquivo(nomeArquivo: string, conteudo: string) {
  fs.writeFile(nomeArquivo, conteudo, (err) => {
    if (err) {
      console.error(`Erro ao salvar ${nomeArquivo}:`, err);
    } else {
      console.log(`${nomeArquivo} salvo com sucesso!`);
    }
  });
}

// URL da página web a ser analisada
const url = "https://google.com/";

// Chamar a função e extrair os recursos da URL
extrairRecursos(url).then((recursos) => {
  if (recursos) {
    // Salvar HTML
    salvarArquivo("index.html", recursos.html);

    // Salvar CSS
    recursos.css.forEach((css, index) => {
      axios.get(css).then((response) => {
        salvarArquivo(`style${index}.css`, response.data);
      });
    });

    // Salvar JS
    recursos.js.forEach((js, index) => {
      axios.get(js).then((response) => {
        salvarArquivo(`script${index}.js`, response.data);
      });
    });
  } else {
    console.log("Não foi possível extrair os recursos da página.");
  }
});
