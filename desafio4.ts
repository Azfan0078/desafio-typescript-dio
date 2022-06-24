// Um desenvolvedor tentou criar um projeto que consome a base de dados de filme do TMDB para criar um organizador de filmes, mas desistiu 
// pois considerou o seu código inviável. Você consegue usar typescript para organizar esse código e a partir daí aprimorar o que foi feito?

// A ideia dessa atividade é criar um aplicativo que: 
//    - Busca filmes
//    - Apresenta uma lista com os resultados pesquisados
//    - Permite a criação de listas de filmes e a posterior adição de filmes nela

// Todas as requisições necessárias para as atividades acima já estão prontas, mas a implementação delas ficou pela metade (não vou dar tudo de graça).
// Atenção para o listener do botão login-button que devolve o sessionID do usuário
// É necessário fazer um cadastro no https://www.themoviedb.org/ e seguir a documentação do site para entender como gera uma API key https://developers.themoviedb.org/3/getting-started/introduction

const apiKey: string = '3f301be7381a03ad8d352314dcc3ec1d';
const listId: string = '7101979';

let requestToken: string;
let username: string;
let password: string;
let sessionId: unknown;

const loginButton = document.getElementById('login-button') as HTMLButtonElement;
const searchButton = document.getElementById('search-button') as HTMLButtonElement;
const searchContainer = document.getElementById('search-container') as HTMLDivElement;
const loginInput = document.getElementById('login') as HTMLInputElement
const passwordInput = document.getElementById('senha') as HTMLInputElement
const apiKeyInput = document.getElementById('api-key') as HTMLInputElement

loginButton.addEventListener('click', async () => {
  await criarRequestToken();
  await logar();
  await criarSessao();
})

searchButton.addEventListener('click', async () => {
  let lista = document.getElementById("lista");
  if (lista) {
    lista.outerHTML = "";
  }

  let Query = document.getElementById('search') as HTMLInputElement
  let query = Query.value;
  let listaDeFilmes = await procurarFilme(query);

  let ul = document.createElement('ul');
  ul.id = "lista"
  if (listaDeFilmes && typeof listaDeFilmes === 'object') {
    for (const item of listaDeFilmes['results']) {
      let li = document.createElement('li');
      li.appendChild(document.createTextNode(item.original_title))
      ul.appendChild(li)
    }
    searchContainer.appendChild(ul);
  }
})

loginInput.addEventListener('keydown', preencherLogin)
passwordInput.addEventListener('keydown', preencherSenha)
apiKeyInput.addEventListener('keydown', preencherApi)

function preencherSenha() {
  password = passwordInput.value;
  validateLoginButton();
}

function preencherLogin() {
  username = loginInput.value;
  validateLoginButton();
}

function preencherApi() {
  const apiKey = apiKeyInput.value;
  validateLoginButton(apiKey);
}

function validateLoginButton(apiKey?) {
  if (password && username && apiKey) {
    loginButton.disabled = false;
  } else {
    loginButton.disabled = true;
  }
}

class HttpClient {
  static async get({ url, method, body = {} }) {
    return new Promise((resolve, reject) => {
      let request = new XMLHttpRequest();
      request.open(method, url, true);

      request.onload = () => {
        if (request.status >= 200 && request.status < 300) {
          resolve(JSON.parse(request.responseText));
        } else {
          reject({
            status: request.status,
            statusText: request.statusText
          })
        }
      }
      request.onerror = () => {
        reject({
          status: request.status,
          statusText: request.statusText
        })
      }
      let message: string = ''
      if (body) {
        request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        message = JSON.stringify(body)

      }
      request.send(message);
    })
  }
}

async function procurarFilme(query): Promise<unknown> {
  query = encodeURI(query)
  console.log(query)
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}`,
    method: "GET"
  })
  return result
}

async function adicionarFilme(filmeId) {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/movie/${filmeId}?api_key=${apiKey}&language=en-US`,
    method: "GET"
  })
  console.log(result);
}

async function criarRequestToken() {
  let result: unknown = await HttpClient.get({
    url: `https://api.themoviedb.org/3/authentication/token/new?api_key=${apiKey}`,
    method: "GET"
  })
  if (result && typeof result === 'object') {
    requestToken = result['request_token']
  }

}

async function logar() {
  await HttpClient.get({
    url: `https://api.themoviedb.org/3/authentication/token/validate_with_login?api_key=${apiKey}`,
    method: "POST",
    body: {
      username: `${username}`,
      password: `${password}`,
      request_token: `${requestToken}`
    }
  })
}

async function criarSessao() {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/authentication/session/new?api_key=${apiKey}&request_token=${requestToken}`,
    method: "GET"
  })
  if (result && typeof result === 'object') {
    sessionId = result['session_id'];
  }

  console.log(result)
}

async function criarLista(nomeDaLista, descricao) {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/list?api_key=${apiKey}&session_id=${sessionId}`,
    method: "POST",
    body: {
      name: nomeDaLista,
      description: descricao,
      language: "pt-br"
    }
  })
  console.log(result);
}

async function adicionarFilmeNaLista(filmeId, listaId) {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/list/${listaId}/add_item?api_key=${apiKey}&session_id=${sessionId}`,
    method: "POST",
    body: {
      media_id: filmeId
    }
  })
  console.log(result);
}

async function pegarLista() {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/list/${listId}?api_key=${apiKey}`,
    method: "GET"
  })
  console.log(result);
}

