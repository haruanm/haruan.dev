# Deploy — GitHub Pages

Site estático puro: sem build, sem dependências. O que está na pasta é o que vai pro ar.

---

## 1. O nome do repositório importa

Crie o repositório com o nome **`haruanm.github.io`** (troque `haruanm` pelo seu
usuário do GitHub, exatamente igual).

Isso não é preferência — é requisito técnico aqui. Um repositório de *user page*
serve o site na raiz (`https://haruanm.github.io/`), e este site usa caminhos
absolutos (`/styles.css`, `/assets/...`). Num repositório comum, o site sairia em
`https://haruanm.github.io/nome-do-repo/` e **todos** os caminhos absolutos
quebrariam — CSS, fontes, imagens, o CV.

O `404.html` também depende disso: ele é servido a partir de qualquer
profundidade de URL (`/a/b/c`), então precisa referenciar assets pela raiz.

## 2. Publicar

```bash
cd C:/Users/harua/projetos/website
git init
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin git@github.com:haruanm/haruanm.github.io.git
git push -u origin main
```

Depois: **Settings → Pages → Source: Deploy from a branch → `main` / `/ (root)`**.

Primeira publicação leva alguns minutos. Marque **Enforce HTTPS**.

> A pasta `media/` contém o currículo e a carta de apresentação originais. Se não
> quiser esses arquivos públicos, adicione `media/` a um `.gitignore` antes do
> primeiro commit — o CV publicado é a cópia em `assets/haruan-justino-cv.pdf`.

## 3. Trocar o domínio (se usar domínio próprio)

A URL aparece em 15 lugares. Substitua `https://haruanm.github.io` em:

| Arquivo | Ocorrências | O que é |
|---|---|---|
| `index.html` | 5 | canonical, og:url, og:image, twitter:image, JSON-LD |
| `blog/index.html` | 3 | canonical, og:url, og:image |
| `blog/_template.html` | 5 | canonical, og:url, og:image, article, JSON-LD |
| `robots.txt` | 1 | linha `Sitemap:` |
| `sitemap.xml` | 1 | `<loc>` |

Para domínio próprio, crie também um arquivo `CNAME` na raiz com o domínio
(uma linha, sem `https://`) e aponte o DNS conforme a documentação do GitHub.

---

## O que o GitHub Pages **não** faz

**Headers HTTP customizados.** Não há como configurá-los. Consequências:

- A **CSP** está declarada via `<meta http-equiv>` em cada página. Funciona para
  `script-src`, `style-src`, `img-src`, `font-src`, `base-uri` e `form-action`.
- `frame-ancestors` e `X-Frame-Options` **só existem como header HTTP de verdade**.
  Ou seja: neste deploy o site pode ser embutido em iframe por terceiros. Para um
  portfólio o risco é baixo (não há login nem formulário — nada de clickjacking a
  roubar), mas é uma diferença real em relação ao site do seu amigo.
- **HSTS** também é header. O GitHub envia HSTS em `*.github.io` por conta
  própria; em domínio próprio, ele passa a enviar depois que o HTTPS estabiliza.
  Fora do seu controle de qualquer forma.

**Se esses headers importarem**, o mesmo conteúdo publica sem alteração nenhuma
no Cloudflare Pages ou Netlify — basta adicionar um arquivo `_headers` na raiz:

```
/*
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
```

Nesse caso, remova as tags `<meta http-equiv="Content-Security-Policy">` das
páginas para não ter duas políticas concorrentes (a mais restritiva vence, e
depurar isso é chato).

---

## Publicar um post no blog

O `/blog/` já está pronto e estilizado — só não está ligado na navegação.

1. Copie `blog/_template.html` para `blog/<slug>.html`.
2. Substitua todos os `⟨PLACEHOLDERS⟩` e **remova a linha
   `<meta name="robots" content="noindex">`**.
3. Em `blog/index.html`, adicione um bloco `<a class="post-item">` (tem um
   exemplo comentado lá, é só copiar) e apague o parágrafo `.post-empty`.
4. Adicione a URL do post em `sitemap.xml`.
5. Em `index.html`, descomente a linha do menu:
   `<!-- <a href="/blog/">blog</a> -->`

O CSS de artigo já cobre `h2`, `h3`, `p`, `ul`, `ol`, `blockquote`, `code`,
`pre`, `hr`, `img` e links — não precisa escrever estilo nenhum.

---

## Atualizar o CV

`assets/haruan-justino-cv.pdf` é uma cópia de `media/Haruan_Justino_Resume.pdf`.
Ao atualizar o currículo, copie por cima:

```bash
cp media/Haruan_Justino_Resume.pdf assets/haruan-justino-cv.pdf
```

---

## Testar localmente

Não abra o `index.html` com duplo clique — os caminhos absolutos não funcionam
em `file://`. Suba um servidor:

```powershell
# qualquer servidor estático serve; exemplo com o npx, se tiver node:
npx serve .
```

Sem node instalado, o `.claude/` desta pasta não inclui servidor — mas qualquer
extensão "Live Server" de editor resolve.
