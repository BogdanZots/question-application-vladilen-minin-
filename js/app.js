const form = document.getElementById('form')
const input = form.querySelector('#question-input') // не работает для getElementById/Class
const submitBtn = form.querySelector('#submit')
const modalBtn = document.querySelector('#modal-btn')


modalBtn.addEventListener('click', openModal)

class Question {
    static create(question) {
        return fetch('https://new-62367-default-rtdb.firebaseio.com/question.json', { // question json - нужно для создания колекции ( типо api от firebase)
                method: 'POST',
                body: JSON.stringify(question), // переводим наш обьект который в submitFormHandler в формат json 
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json()) // наш обьект question парсим в формат json
            .then(response => {
                question.id = response.name; // делаем новое поле у обьекта question и присваеваем туда отпарсеный response
                return question // response.name - это какой то зашифр. ключ (api firabase)
            })
            .then(function (question) { // типо выносим код внаружу    
                // обьект question теперь содержит три поля : name(id) , сам вопрос , и дату вопроса 
                return addToLocalStorage(question) // передаём сюда обьект с then'a выше 
            })
            .then(Question.renderList)
    }
    static fetch(token){
        if(!token){
            return Promise.resolve(`<P>you have not token </P>`);
        }
     return   fetch(`https://new-62367-default-rtdb.firebaseio.com/question.json?auth=${token}`)
        .then(response => response.json())
        .then(questions =>{
           if(questions.error){
               return `<P class="error">${response.error}</P>`
           }
           return response ? Object.keys(response).map(key => ({
               ...response[key],
               id : key
           })) : []
        })
    }
    static renderList() {
        const question = getQuestionsFromLocalStorage();
        console.log(question)
        let html = '';
        if (question.length >= 0) { // question length означает что длина не будет нулевой    
            // map будет трансф. массив обьектов questions 
            question.map(function (item) { // так как нужна строка для html исп. join('') 
                return html += ` <div class="mui--text-black-54">
            ${new Date(item.date).toLocaleDateString()}
            ${new Date(item.date).toLocaleTimeString()}
            </div>
            <div>${item.text}</div>
            `
            })
        } else {
            html = `<div class="mui--text-headling">Вопросов пока нету</div>`
        }


        const list = document.getElementById('list')
        list.innerHTML = html;
        console.log(list)
    }
}

window.addEventListener('load', Question.renderList)

form.addEventListener('submit', submitFormHandler) // Вызываем фунцию по клику 

input.addEventListener('input', () => {
    submitBtn.disabled = !isValid(input.value)
})




function addToLocalStorage(question) {
    const all = getQuestionsFromLocalStorage() // создаём массив 
    all.push(question) // обавляем в него наш question
    localStorage.setItem('question', JSON.stringify(all)) // устанавливаем массив all в localStorage по ключу question
}

function getQuestionsFromLocalStorage() {
    return JSON.parse(localStorage.getItem('question') || '[]') // получаем данные из localStorage по ключу questions , если такой ключ ещё не создан
    // то получаем пустой массив
}


function submitFormHandler(e) { //  
    e.preventDefault();
    if (isValid(input.value)) {
        const question = {
            text: input.value.trim(),
            date: new Date().toJSON(),
        }
        submitBtn.disabled = true;
        // async request to server for save question
        Question.create(question) // функиц для отправки вопроса в бд 
            .then(() => { // then выполниться после запроса к серверу
                input.value = '';
                submitBtn.disabled = false;
            })
    }
}

function isValid(value) {
    return value.length >= 10;
}


function createModal(title, content) {
    const modal = document.createElement('div')
    modal.classList.add('modal')
    mui.overlay('on', modal)

    modal.innerHTML = `
<h1>${title}</h1>
<div class="modal-content">${content}</div>
`
    mui.overlay('on', modal)
}

function getAuthForm() {
    return `
<form class="mui-form" id="auth-form">
<legend>Title</legend>
<div class="mui-textfield mui-textfield--float-label">
  <input type="email" id="email" required>
  <label for="email">Email</label>
</div>
<div class="mui-textfield mui-textfield--float-label">
  <input type="password" id="password" required>
  <label for="password">Password</label>
</div>
<button type="submit"  class="mui-btn mui-btn--raised" dis>Send</button>
</form>
`
}


function authFormHandelr(e) {
    e.preventDefault();
    console.log(e.target)

    const email = e.target.querySelector('#email').value;
    const password = e.target.querySelector('#password').value;
    authWithEmailAndPass(email,password)
    .then(Question.fetch)
    .then(renderModalAfterAuth)
}

function renderModalAfterAuth(content){
console.log(content)
}

function openModal() {
    createModal('Авторизация', getAuthForm())
    document.getElementById('auth-form').addEventListener('submit', authFormHandelr, {
        once: true
    })
}

function authWithEmailAndPass(email,password) {
    const apiKey = 'AIzaSyB_rMxDgG5JNq5UGdecWLqF-7p8hSFUMs4'
    return fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
        method: 'POST',
        body: JSON.stringify({
            email: email,
            password: password,
            returnSecureToken:true,
        }),
        headers :{
            'Content-Type':'application/json'
        }
    })
    .then(response => response.json())
    .then(data => data.idToken)

}