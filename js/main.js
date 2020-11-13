// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDG6_QToW2UCRjrgb2CKYB1dUBxs2g65Iw",
  authDomain: "pikadujs.firebaseapp.com",
  databaseURL: "https://pikadujs.firebaseio.com",
  projectId: "pikadujs",
  storageBucket: "pikadujs.appspot.com",
  messagingSenderId: "59034353762",
  appId: "1:59034353762:web:c96d60fc208f53b657913b"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
console.log(firebase);


// Создаем переменную, в которую положим кнопку меню
let menuToggle = document.querySelector('#menu-toggle');
// Создаем переменную, в которую положим меню
let menu = document.querySelector('.sidebar');

const regExpValidEmail = /^\w+@\w+\.\w{2,}$/;

const loginElem = document.querySelector('.login');
const loginForm = document.querySelector('.login-form');
const emailInput = document.querySelector('.login-email');
const passwordInput = document.querySelector('.login-password');
const loginSignUp = document.querySelector('.login-signup');

const userElem = document.querySelector('.user');
const userNameElem = document.querySelector('.user-name');

const sidebarNavBlock = document.querySelector('.sidebar-nav');
const buttonNewPostBlock = document.querySelector('.button-new-post');

const exitElem = document.querySelector('.exit');
const editElem = document.querySelector('.edit');
const editContainer = document.querySelector('.edit-container');

const editUserName = document.querySelector('.edit-username');
const editUserAvatar = document.querySelector('.edit-avatar');
const userAvatarElem = document.querySelector('.user-avatar');

const postsWrapper = document.querySelector('.posts');
const addPostElem = document.querySelector('.add-post');

const DEFAULT_PHOTO = userAvatarElem.src;

const loginForhet = document.querySelector('.login-forget');

const setUsers = {
  user: null,
  // слушатель
  /*Получить зарегистрированного пользователя
    Рекомендуемый способ получить текущего пользователя -  
      установить наблюдателя на объект Auth: 
  */
  initUser(handler) {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.user = user;
      } else {
        this.user = null;
      }
      if (handler) handler();
    });
  },

  // ВХОД
  logIn(email, password, handler) {
    if (!regExpValidEmail.test(email))
      return alert('email не валиден');

    firebase.auth()
      .signInWithEmailAndPassword(email, password)
      .catch(err => {
        const errCode = err.code;
        const errMaessage = err.message;
        if (errCode === 'auth/wrong-password') {
          console.log(errMaessage);
          alert('Неверный пароль');
        } else if (errCode === 'auth/user-not-found') {
          console.log(errMaessage);
          alert('Пользователь не найден');
        } else {
          alert(errMaessage);
        }
        console.log(err);
      });
  },
  // ВЫХОД
  logOut() { 
    firebase.auth().signOut();
  },
  // РЕГИСТРАЦИЯ
  signUp(email, password, handler) {
    if (!regExpValidEmail.test(email))
      return alert('email не валиден');

    if (!email.trim() || !password.trim()) {
      alert('Введите данные');
      return;
    }

    // createUserWithEmailAndPassword - возвращает промисс
    // авторизация пользователя
    firebase.auth()
      .createUserWithEmailAndPassword(email, password)
      .then(data => {
        this.editUser(email.substring(0, email.indexOf('@')), null, handler);
      })
      .catch(err => {
        const errCode = err.code;
        const errMaessage = err.message;
        if (errCode === 'auth/weak-password') {
          console.log(errMaessage);
          alert('Слабый пароль');
        } else if (errCode === 'auth/email-already-in-use') {
          console.log(errMaessage);
          alert('Этот email уже используется');
        } else {
          alert(errMaessage);
        }
        console.log(err);
      });
  },
  // РЕДАКТИРОВАТЬ логин и аватар
  editUser(displayName, photoURL, handler) {
    const user = firebase.auth().currentUser;

    if (displayName) {
      if (photoURL) {
        user.updateProfile({
          displayName,
          photoURL
        }).then(handler);
      } else {
        user.updateProfile({
          displayName
        }).then(handler);
      }
    }
  },
  sendForget(email) {
    firebase.auth().sendPasswordResetEmail(email)
      .then(() => {
        alert('Письмо отправлено');
      })
      .catch(err => {
        console.log(err);
      });
  }
};

const setPosts = {
  allPosts: [],
  addPost(title, text, tags, handler) {
    const user = firebase.auth().currentUser;

    this.allPosts.unshift({
      id: `postID${(+new Date()).toString(16)}-${user.uid}`,
      title,
      text,
      tags: tags.split(',').map(tag => tag.trim()),
      author: {
        displayName: setUsers.user.displayName,
        avatar: setUsers.user.photoURL,
      },
      date: new Date().toLocaleString(),
      like: 0,
      comments: 0,
    });

    firebase.database().ref('post').set(this.allPosts)
      .then(() => this.getPosts(handler));
  },
  getPosts(handler) {
    firebase.database().ref('post').on('value', snapshot => {
      this.allPosts = snapshot.val() || [];
      handler();
    })
  }
};

const toggleAuthDom = () => {
  const user = setUsers.user;
  console.log('user:', user);

  if (user) {
    userNameElem.textContent = user.displayName;
    userAvatarElem.src = user.photoURL || DEFAULT_PHOTO;

    loginElem.style.display = 'none';
    userElem.style.display = '';
    sidebarNavBlock.style.display = '';
    buttonNewPostBlock.classList.add('visible');

  } else {
    loginElem.style.display = '';
    userElem.style.display = 'none';
    sidebarNavBlock.style.display = 'none';
    buttonNewPostBlock.classList.remove('visible');
    addPostElem.classList.remove('visible');
    postsWrapper.classList.add('visible');
  }
};
const showAddPost = () => {
  addPostElem.classList.add('visible');
  postsWrapper.classList.remove('visible');
  buttonNewPostBlock.classList.remove('visible');
};

const showAllPosts = () => {
  let postsHTML = '';

  setPosts.allPosts.forEach(post => {
    const { title, text, tags, author, date, like, comments } = post;

    postsHTML += `
    <section class="post">
    <div class="post-body">
      <h2 class="post-title">${title}</h2>
      <p class="post-text">${text}</p>
      <div class="tags">      
      ${tags.reduce((str, tag) => {
      return str + `<a href="#" class="tag">#` + tag + `</a>`;
    }, '')}
      </div>
    </div>
    <div class="post-footer">
      <div class="post-buttons">
        <button class="post-button likes">
          <svg class="icon icon-like" width="19" height="20">
            <use xlink:href="img/icons.svg#like"></use>
          </svg>
          <span class="likes-counter">${like}</span>
        </button>
        <button class="post-button comments">
          <svg class="icon icon-comment" width="21" height="21">
            <use xlink:href="img/icons.svg#comment"></use>
          </svg>
          <span class="comments-counter">${comments}</span>
        </button>
        <button class="post-button save">
          <svg class="icon icon-save" width="19" height="19">
            <use xlink:href="img/icons.svg#save"></use>
          </svg>
        </button>
        <button class="post-button share">
          <svg class="icon icon-share" width="17" height="19">
            <use xlink:href="img/icons.svg#share"></use>
          </svg>
        </button>
      </div>
      <div class="post-author">
        <div class="author-about">
          <a href="#" class="author-username">${author.displayName}</a>
          <span class="post-time">${date}</span>
        </div>
        <a href="#" class="author-link">
          <img src="${author.avatar || "img/avatar.jpg"}" alt="avatar" class="author-avatar"></a>
      </div>
    </div>
  </section>
    `;
  });
  postsWrapper.innerHTML = postsHTML;

  addPostElem.classList.remove('visible');
  postsWrapper.classList.add('visible');
  buttonNewPostBlock.classList.add('visible');
};

const init = () => {
  // отслеживаем клик по кнопке меню и запускаем функцию 
  menuToggle.addEventListener('click', function (event) {
    // отменяем стандартное поведение ссылки
    event.preventDefault();
    // вешаем класс на меню, когда кликнули по кнопке меню 
    menu.classList.toggle('visible');
  });

  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();

    setUsers.logIn(emailInput.value, passwordInput.value, toggleAuthDom);
    loginForm.reset();
  });

  loginSignUp.addEventListener('click', (event) => {
    event.preventDefault();

    setUsers.signUp(emailInput.value, passwordInput.value, toggleAuthDom);
    loginForm.reset();
  });

  exitElem.addEventListener('click', event => {
    event.preventDefault();
    setUsers.logOut();

  });

  editElem.addEventListener('click', event => {
    event.preventDefault();
    editContainer.classList.toggle('visible');
    editUserName.value = setUsers.user.displayName;
  });

  editContainer.addEventListener('submit', event => {
    event.preventDefault();
    setUsers.editUser(editUserName.value, editUserAvatar.value, toggleAuthDom);
    editContainer.classList.remove('visible');
  });

  buttonNewPostBlock.addEventListener('click', event => {
    event.preventDefault();
    showAddPost();
  });

  addPostElem.addEventListener('submit', event => {
    event.preventDefault();
    const { title, text, tags } = addPostElem.elements;

    if (title.value.length < 6) {
      alert('Слишком короткий заголовок');
      return;
    }
    if (text.value.length < 50) {
      alert('Слишком короткий пост');
      return;
    }
    setPosts.addPost(title.value, text.value, tags.value, showAllPosts);
    addPostElem.classList.remove('visible');
    addPostElem.reset();
  });

  loginForhet.addEventListener('click', event => {
    event.preventDefault();
    setUsers.sendForget(emailInput.value);
    emailInput.value = '';
  });

  setUsers.initUser(toggleAuthDom);
  setPosts.getPosts(showAllPosts);
};

document.addEventListener('DOMContentLoaded', init);