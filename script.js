let products = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentPage = 0;
let itemsPerPage = 5;

const categoryUrls = {
    smartphones: 'https://dummyjson.com/products/category/smartphones',
    laptops: 'https://dummyjson.com/products/category/laptops',
    beauty: 'https://dummyjson.com/products/category/beauty',
    food: 'https://dummyjson.com/products/category/food'
};

const productList = document.getElementById('product-list');
const cartItemsList = document.getElementById('cart-items');
const totalItems = document.getElementById('total-items');
const totalPrice = document.getElementById('total-price');
const itemsPerPageSelect = document.getElementById('items-per-page');
const openCartBtn = document.getElementById('open-cart');
const closeCartBtn = document.querySelector('.close-cart');
const cartAside = document.querySelector('aside');
const cartOverlay = document.querySelector('.cart-overlay');

const fetchProducts = (category = 'all', limit = itemsPerPage, skip = currentPage * itemsPerPage) => {
    let url;
    if (category === 'all') {
        url = `https://dummyjson.com/products?limit=${limit}&skip=${skip}`;
    } else if (categoryUrls[category]) {
        url = `${categoryUrls[category]}?limit=${limit}&skip=${skip}`;
    } else {
        return;
    }

    fetch(url)
        .then(res => res.json())
        .then(data => {
            products = data.products;
            displayProducts(products);
        })
        .catch(() => {
            productList.innerHTML = '<p>Failed to load products. Please try again later.</p>';
        });
};

const displayProducts = (products) => {
    productList.innerHTML = '';
    products.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.className = 'product';
        productDiv.innerHTML = `
            <img src="${product.thumbnail || 'placeholder.jpg'}" alt="${product.title}">
            <div class="product-info">
                <h3>${product.title}</h3>
                <p>$${product.price}</p>
                <button onclick="addToCart(${product.id})">
                    <i class="fas fa-shopping-cart"></i>
                    Add to Cart
                </button>
            </div>
        `;
        productList.appendChild(productDiv);
    });
};

const addToCart = (id) => {
    const product = products.find(p => p.id === id);
    const cartItem = cart.find(item => item.id === id);
    
    if (cartItem) {
        cartItem.quantity += 1;
    } else {
        cart.push({...product, quantity: 1});
    }
    
    updateCart();
};

const updateCart = () => {
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCart();
};

const displayCart = () => {
    cartItemsList.innerHTML = '';
    let totalItemsCount = 0;
    let totalPriceCount = 0;

    cart.forEach(item => {
        totalItemsCount += item.quantity;
        totalPriceCount += item.price * item.quantity;

        const li = document.createElement('li');
        li.innerHTML = `
            <div class="cart-item-details">
                <h4>${item.title}</h4>
                <p>$${item.price}</p>
            </div>
            <div class="cart-item-quantity">
                <button onclick="changeQuantity(${item.id}, -1)">-</button>
                <span>${item.quantity}</span>
                <button onclick="changeQuantity(${item.id}, 1)">+</button>
            </div>
            <button class="remove-item" onclick="removeFromCart(${item.id})">
                <i class="fas fa-trash"></i>
            </button>
        `;
        cartItemsList.appendChild(li);
    });

    totalItems.textContent = totalItemsCount;
    totalPrice.textContent = totalPriceCount.toFixed(2);
};

const changeQuantity = (id, delta) => {
    const cartItem = cart.find(item => item.id === id);
    if (cartItem) {
        cartItem.quantity += delta;
        if (cartItem.quantity <= 0) {
            removeFromCart(id);
        } else {
            updateCart();
        }
    }
};

const removeFromCart = (id) => {
    cart = cart.filter(item => item.id !== id);
    updateCart();
};

// Cart open/close functionality
openCartBtn.addEventListener('click', () => {
    cartAside.classList.add('open');
    cartOverlay.classList.add('open');
});

closeCartBtn.addEventListener('click', () => {
    cartAside.classList.remove('open');
    cartOverlay.classList.remove('open');
});

cartOverlay.addEventListener('click', () => {
    cartAside.classList.remove('open');
    cartOverlay.classList.remove('open');
});

// Event Listeners
itemsPerPageSelect.addEventListener('change', (e) => {
    itemsPerPage = parseInt(e.target.value);
    currentPage = 0;
    fetchProducts();
});

document.getElementById('prev').addEventListener('click', () => {
    if (currentPage > 0) {
        currentPage--;
        fetchProducts();
    }
});

document.getElementById('next').addEventListener('click', () => {
    currentPage++;
    fetchProducts();
});

document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const category = e.target.getAttribute('data-category');
        currentPage = 0;
        fetchProducts(category);
    });
});

// Initialize the app
fetchProducts();
updateCart();
