let products = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentPage = 0;
let itemsPerPage = 5;

// menetapkan kategori yang sesuai untuk URL
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


const fetchProducts = (category = 'all', limit = itemsPerPage, skip = currentPage * itemsPerPage) => {
    let url;

    if (category === 'all') {
        url = `https://dummyjson.com/products?limit=${limit}&skip=${skip}`;
    } else if (categoryUrls[category]) {
        url = `${categoryUrls[category]}?limit=${limit}&skip=${skip}`;
    } else {
        return; // jika kategori tidak valid, tidak melakukan apapun
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

// Display products on the page
const displayProducts = (products) => {
    productList.innerHTML = '';
    products.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.className = 'product';
        productDiv.innerHTML = `
            <img src="${product.thumbnail || 'placeholder.jpg'}" alt="${product.title}">
            <h3>${product.title}</h3>
            <p>$${product.price}</p>
            <button onclick="addToCart(${product.id})">Add to Cart</button>
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

        const cartItem = document.createElement('li');
        cartItem.innerHTML = `
            ${item.title} - $${item.price} x 
            <button onclick="changeQuantity(${item.id}, 1)">+</button>
            ${item.quantity}
            <button onclick="changeQuantity(${item.id}, -1)">-</button>
            <button onclick="removeFromCart(${item.id})">Remove</button>
        `;
        cartItemsList.appendChild(cartItem);
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

itemsPerPageSelect.addEventListener('change', (e) => {
    itemsPerPage = parseInt(e.target.value);
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
        fetchProducts(category); 
    });
});

fetchProducts(); 
updateCart(); 


document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault(); 
        const category = e.target.getAttribute('data-category'); 
        currentPage = 0; // mereset page ketika di refresh
        fetchProducts(category); // Fetch products ketika kategori di pilih
    });
});

// Initialize function pada saat product loading dan penambahan cart
const initialize = () => {
    fetchProducts(); // fetch products on page load
    updateCart(); // update cart pada saat page load
};


window.addEventListener('storage', (event) => {
    if (event.key === 'cart') {
        cart = JSON.parse(event.newValue) || []; // Update cart kalau terditeksi perubahan
        displayCart(); // ngerefresh tampilan cart
    }
});

// Initialize the app
initialize();


const clearCart = () => {
    cart = [];
    localStorage.removeItem('cart'); // ngehapus keranjang dri local storgae
    displayCart(); // Update tampilan keranjangnya
};



