// Основной файл для работы с корзиной

// Элементы DOM
const cartIcon = document.querySelector('.cart-icon') // Иконка корзины (нужно добавить в HTML)
const cartModal = document.querySelector('.cart-modal') // Модальное окно корзины (нужно в HTML)
const cartItemsList = document.querySelector('.cart-items') // Список товаров в корзине
const totalPriceElement = document.querySelector('.total-price') // Итоговая сумма
const productForm = document.querySelector('#product-form') // Форма добавления товара

// Массив корзины
let cart = JSON.parse(localStorage.getItem('cart')) || [] // Загружаем из LocalStorage или пустой массив

// Функция обновления итоговой суммы
function updateTotalPrice() {
  let total = 0
  cart.forEach((item) => {
    total += item.price * item.quantity // Суммируем цена * количество
  })
  totalPriceElement.textContent = `Итого: ${total} руб` // Обновляем текст
}

// Функция отрисовки корзины
function renderCart() {
  cartItemsList.innerHTML = '' // Очищаем список
  cart.forEach((item, index) => {
    let itemHtml = `
      <div class="cart-item">
        <p>${item.name} - ${item.price} руб</p>
        <div class="stepper">
          <button class="minus" onclick="changeQuantity(${index}, -1)">-</button>
          <input type="number" value="${item.quantity}" min="1" max="10" readonly>
          <button class="plus" onclick="changeQuantity(${index}, 1)">+</button>
        </div>
        <button onclick="removeItem(${index})">Удалить</button>
      </div>
    `
    cartItemsList.insertAdjacentHTML('beforeend', itemHtml)
  })
  updateTotalPrice() // Обновляем сумму после отрисовки
  localStorage.setItem('cart', JSON.stringify(cart)) // Сохраняем в LocalStorage
}

// Добавление товара в корзину
function addToCart(product) {
  let existingItem = cart.find((item) => item.id === product.id)
  if (existingItem) {
    if (existingItem.quantity < 10) {
      existingItem.quantity += 1 // Увеличиваем количество, если меньше 10
    }
  } else {
    product.quantity = 1 // Новый товар с количеством 1
    cart.push(product)
  }
  renderCart() // Перерисовываем корзину
}

// Изменение количества товара
function changeQuantity(index, change) {
  let item = cart[index]
  item.quantity += change // Меняем количество
  if (item.quantity < 1) {
    item.quantity = 1 // Минимальное значение 1
  }
  if (item.quantity > 10) {
    item.quantity = 10 // Максимальное значение 10
  }
  renderCart() // Обновляем корзину
}

// Удаление товара
function removeItem(index) {
  let confirmDelete = confirm('Вы уверены, что хотите удалить товар из корзины?')
  if (confirmDelete) {
    cart.splice(index, 1) // Удаляем товар
    renderCart() // Перерисовываем
  }
}

// Показ/скрытие модального окна корзины
cartIcon.addEventListener('click', () => {
  cartModal.style.display = 'block' // Показываем модалку
  renderCart() // Отрисовываем корзину
})

// Закрытие модального окна
cartModal.addEventListener('click', (e) => {
  if (e.target === cartModal) {
    cartModal.style.display = 'none' // Закрываем, если клик вне контента
  }
})

// Обработка добавления товара из формы
productForm.addEventListener('submit', (e) => {
  e.preventDefault() // Предотвращаем отправку формы
  let name = document.querySelector('#name').value
  let category = document.querySelector('#category').value
  let rating = document.querySelector('#rating').value
  let price = document.querySelector('#price').value
  let imgSrc = document.querySelector('#imgSrc').value

  // Простая валидация
  if (name == '' || price == '') {
    alert('Заполните имя и цену!')
    return
  }

  let newProduct = {
    name: name,
    category: category,
    rating: rating,
    price: price,
    imgSrc: imgSrc,
    id: 'ID_' + Math.random().toString(36).substr(2, 9), // Генерируем случайный ID
  }

  // Отправка на сервер
  fetch('http://localhost:3000/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newProduct),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log('Товар добавлен:', data)
      productForm.reset()
    })
    .catch((error) => console.log('Ошибка:', error))
})

// Добавление товара из списка в корзину
document.querySelector('.products-list').addEventListener('click', (e) => {
  if (e.target.classList.contains('btn-primary')) {
    let card = e.target.closest('.main-card')
    let product = {
      name: card.querySelector('.card-name').textContent,
      price: parseInt(card.querySelector('.card-price').textContent),
      id: 'ID_' + Math.random().toString(36).substr(2, 9), // Случайный ID
      imgSrc: card.querySelector('img').src,
      category: card.querySelector('.card-category').textContent,
      rating: card.querySelector('.rating-amount').textContent,
    }
    addToCart(product) // Добавляем в корзину
  }
})

// Инициализация при загрузке
renderCart()
