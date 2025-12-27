// الولايات الجزائرية
const algerianStates = [
    "أدرار", "الشلف", "الأغواط", "أم البواقي", "باتنة", "بجاية", "بسكرة", "بشار",
    "البليدة", "البويرة", "تمنراست", "تبسة", "تلمسان", "تيارت", "تيزي وزو", "الجزائر",
    "الجلفة", "جيجل", "سطيف", "سعيدة", "سكيكدة", "سيدي بلعباس", "عنابة", "قالمة",
    "قسنطينة", "المدية", "مستغانم", "المسيلة", "معسكر", "ورقلة", "وهران", "البيض",
    "إليزي", "برج بوعريريج", "بومرداس", "الطارف", "تندوف", "تيسمسيلت", "الوادي",
    "خنشلة", "سوق أهراس", "تيبازة", "ميلة", "عين الدفلى", "النعامة", "عين تموشنت",
    "غرداية", "غليزان", "تيميمون", "برج باجي مختار", "أولاد جلال", "بني عباس",
    "عين صالح", "عين قزام", "تقرت", "جانت", "المقرر", "المنيعة"
];

let products = [];
let orders = [];
let deliveryPrices = {};
let selectedProduct = null;
let filteredProducts = [];
const carouselIntervals = {};

// ===================
// تهيئة البيانات
// ===================

async function initializeDeliveryPrices() {
    deliveryPrices = await loadDeliveryPrices();
    
    let changed = false;
    algerianStates.forEach(state => {
        if (!deliveryPrices[state]) {
            deliveryPrices[state] = { home: 300, office: 250 };
            changed = true;
        }
    });
    
    if (changed) {
        await saveDeliveryPrices(deliveryPrices);
    }
}

async function initializeProducts() {
    products = await loadProducts();
    
    if (products.length === 0) {
        products = [
            {
                id: 1,
                name: "ساعة ذكية عصرية",
                price: 15000,
                description: "ساعة ذكية متطورة بتقنيات حديثة ومقاومة للماء مع شاشة عالية الدقة وبطارية تدوم طويلاً",
                images: [
                    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
                    "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=400"
                ],
                rating: 5
            },
            {
                id: 2,
                name: "سماعات لاسلكية",
                price: 8500,
                description: "سماعات بلوتوث عالية الجودة مع إلغاء الضوضاء وصوت نقي وعمر بطارية طويل",
                images: [
                    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
                    "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400"
                ],
                rating: 4
            }
        ];
        await saveProducts(products);
    }
    
    filteredProducts = [...products];
    displayProducts();
}

async function initializeOrders() {
    orders = await loadOrders();
}

// ===================
// إدارة المنتجات
// ===================

function updateImageInputs() {
    const count = parseInt(document.getElementById('imageCount').value);
    const container = document.getElementById('imageUrlsContainer');
    container.innerHTML = '';

    for (let i = 1; i <= count; i++) {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'image-url-group';
        groupDiv.innerHTML = `<input type="url" class="image-url-input" placeholder="رابط الصورة ${i}">`;
        container.appendChild(groupDiv);
    }
}

async function addProduct() {
    const name = document.getElementById('productName').value;
    const price = document.getElementById('productPrice').value;
    const description = document.getElementById('productDescription').value;
    const rating = document.getElementById('productRating').value;
    
    const imageInputs = document.querySelectorAll('.image-url-input');
    const images = Array.from(imageInputs)
        .map(input => input.value.trim())
        .filter(url => url !== '');

    if (!name || !price || !description || !rating || images.length === 0) {
        alert('يرجى ملء جميع الحقول وإضافة صورة واحدة على الأقل');
        return;
    }

    const newProduct = {
        id: Date.now(),
        name: name,
        price: parseInt(price),
        description: description,
        images: images,
        rating: parseInt(rating)
    };

    products.push(newProduct);
    filteredProducts = [...products];
    
    await saveProducts(products);
    
    displayProducts();
    displayAdminProducts();
    
    document.getElementById('productName').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productDescription').value = '';
    document.getElementById('productRating').value = '';
    document.getElementById('imageCount').value = '1';
    updateImageInputs();

    alert('تم إضافة المنتج بنجاح!');
}

async function deleteProduct(productId) {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
        products = products.filter(p => p.id !== productId);
        filteredProducts = [...products];
        
        await saveProducts(products);
        
        stopCarousel(productId);
        
        displayProducts();
        displayAdminProducts();
    }
}

function displayProducts() {
    const grid = document.getElementById('productsGrid');
    const noResults = document.getElementById('noResults');
    
    if (filteredProducts.length === 0) {
        grid.style.display = 'none';
        noResults.style.display = 'block';
        return;
    }

    grid.style.display = 'grid';
    noResults.style.display = 'none';
    grid.innerHTML = '';

    filteredProducts.forEach(product => {
        const stars = '★'.repeat(product.rating) + '☆'.repeat(5 - product.rating);
        
        let imagesHtml = '';
        let dotsHtml = '';
        let carouselNav = '';

        if (product.images && product.images.length > 0) {
            product.images.forEach((image, index) => {
                imagesHtml += `<img src="${image}" alt="${product.name}" class="product-image ${index === 0 ? 'active' : ''}">`;
            });

            if (product.images.length > 1) {
                product.images.forEach((_, index) => {
                    dotsHtml += `<div class="carousel-dot ${index === 0 ? 'active' : ''}" onclick="goToSlide(${product.id}, ${index})"></div>`;
                });

                carouselNav = `
                    <button class="carousel-arrow prev" onclick="prevSlide(${product.id})">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <button class="carousel-arrow next" onclick="nextSlide(${product.id})">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                `;
            }
        }
        
        const productCard = `
            <div class="product-card" data-id="${product.id}">
                <div class="product-image-container" id="carousel-${product.id}">
                    ${imagesHtml}
                    ${carouselNav}
                    <div class="carousel-nav">${dotsHtml}</div>
                </div>
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">${product.price} دج</div>
                <p class="product-description">${product.description}</p>
                <div class="product-rating">
                    <span class="stars">${stars}</span>
                    <span>(${product.rating}/5)</span>
                </div>
                <div class="product-actions">
                    <button class="details-btn" onclick="showProductDetails(${product.id})">
                        <i class="fas fa-eye"></i> التفاصيل
                    </button>
                    <button class="order-btn" onclick="openOrderModal(${product.id})">
                        <i class="fas fa-shopping-cart"></i> اطلب الآن
                    </button>
                </div>
            </div>
        `;
        grid.innerHTML += productCard;

        if (product.images && product.images.length > 1) {
            startCarousel(product.id);
        }
    });
}

// ===================
// البحث
// ===================

function searchProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    
    if (searchTerm === '') {
        filteredProducts = [...products];
    } else {
        filteredProducts = products.filter(product => {
            return product.name.toLowerCase().includes(searchTerm) ||
                   product.description.toLowerCase().includes(searchTerm);
        });
    }
    
    Object.keys(carouselIntervals).forEach(id => {
        stopCarousel(parseInt(id));
    });
    
    displayProducts();
}

// ===================
// Carousel
// ===================

function startCarousel(productId) {
    if (carouselIntervals[productId]) {
        clearInterval(carouselIntervals[productId]);
    }
    carouselIntervals[productId] = setInterval(() => {
        nextSlide(productId);
    }, 4000);
}

function stopCarousel(productId) {
    if (carouselIntervals[productId]) {
        clearInterval(carouselIntervals[productId]);
        delete carouselIntervals[productId];
    }
}

function nextSlide(productId) {
    const product = products.find(p => p.id === productId) || filteredProducts.find(p => p.id === productId);
    if (!product || !product.images || product.images.length <= 1) return;

    const carousel = document.getElementById(`carousel-${productId}`);
    if (!carousel) return;

    const images = carousel.querySelectorAll('.product-image');
    const dots = carousel.querySelectorAll('.carousel-dot');
    const currentIndex = Array.from(images).findIndex(img => img.classList.contains('active'));
    const nextIndex = (currentIndex + 1) % images.length;

    images[currentIndex].classList.remove('active');
    images[nextIndex].classList.add('active');

    if (dots.length > 0) {
        dots[currentIndex].classList.remove('active');
        dots[nextIndex].classList.add('active');
    }
}

function prevSlide(productId) {
    const product = products.find(p => p.id === productId) || filteredProducts.find(p => p.id === productId);
    if (!product || !product.images || product.images.length <= 1) return;

    const carousel = document.getElementById(`carousel-${productId}`);
    if (!carousel) return;

    const images = carousel.querySelectorAll('.product-image');
    const dots = carousel.querySelectorAll('.carousel-dot');
    const currentIndex = Array.from(images).findIndex(img => img.classList.contains('active'));
    const prevIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;

    images[currentIndex].classList.remove('active');
    images[prevIndex].classList.add('active');

    if (dots.length > 0) {
        dots[currentIndex].classList.remove('active');
        dots[prevIndex].classList.add('active');
    }
}

function goToSlide(productId, slideIndex) {
    const carousel = document.getElementById(`carousel-${productId}`);
    if (!carousel) return;

    const images = carousel.querySelectorAll('.product-image');
    const dots = carousel.querySelectorAll('.carousel-dot');

    images.forEach(img => img.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));

    if (images[slideIndex]) images[slideIndex].classList.add('active');
    if (dots[slideIndex]) dots[slideIndex].classList.add('active');

    startCarousel(productId);
}

// ===================
// أسعار التوصيل
// ===================

async function updateDeliveryPrices() {
    const state = document.getElementById('deliveryState').value;
    const homePrice = document.getElementById('homeDeliveryPrice').value;
    const officePrice = document.getElementById('officeDeliveryPrice').value;

    if (!state || !homePrice || !officePrice) {
        alert('يرجى ملء جميع الحقول');
        return;
    }

    deliveryPrices[state] = {
        home: parseInt(homePrice),
        office: parseInt(officePrice)
    };

    await saveDeliveryPrices(deliveryPrices);

    alert('تم تحديث أسعار التوصيل بنجاح');
    
    document.getElementById('deliveryState').value = '';
    document.getElementById('homeDeliveryPrice').value = '';
    document.getElementById('officeDeliveryPrice').value = '';
}

function loadDeliveryStates() {
    const select = document.getElementById('deliveryState');
    select.innerHTML = '<option value="">اختر الولاية</option>';
    
    algerianStates.forEach(state => {
        select.innerHTML += `<option value="${state}">${state}</option>`;
    });
}

// ===================
// الطلبات
// ===================

function openOrderModal(productId) {
    selectedProduct = products.find(p => p.id === productId);
    const modal = document.getElementById('orderModal');
    const productInfo = document.getElementById('selectedProductInfo');
    
    const firstImage = selectedProduct.images && selectedProduct.images.length > 0 ? selectedProduct.images[0] : '';
    
    productInfo.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
            ${firstImage ? `<img src="${firstImage}" alt="${selectedProduct.name}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 10px;">` : ''}
            <h4>${selectedProduct.name}</h4>
            <p style="color: #e74c3c; font-size: 1.2em; font-weight: bold;">${selectedProduct.price} دج</p>
        </div>
    `;
    
    const stateSelect = document.getElementById('customerState');
    stateSelect.innerHTML = '<option value="">اختر الولاية</option>';
    
    algerianStates.forEach(state => {
        stateSelect.innerHTML += `<option value="${state}">${state}</option>`;
    });
    
    modal.style.display = 'block';
}

function closeOrderModal() {
    document.getElementById('orderModal').style.display = 'none';
    document.getElementById('orderForm').reset();
    document.getElementById('deliveryPriceDisplay').innerHTML = '';
}

function updateDeliveryPrice() {
    const state = document.getElementById('customerState').value;
    const deliveryType = document.getElementById('deliveryType').value;
    const priceDisplay = document.getElementById('deliveryPriceDisplay');

    if (state && deliveryType && deliveryPrices[state]) {
        const price = deliveryPrices[state][deliveryType];
        priceDisplay.innerHTML = `تكلفة التوصيل: ${price} دج`;
    } else {
        priceDisplay.innerHTML = '';
    }
}

async function submitOrder(e) {
    e.preventDefault();
    
    const customerName = document.getElementById('customerName').value;
    const customerPhone = document.getElementById('customerPhone').value;
    const customerState = document.getElementById('customerState').value;
    const deliveryType = document.getElementById('deliveryType').value;
    
    const deliveryPrice = deliveryPrices[customerState][deliveryType];
    const totalPrice = selectedProduct.price + deliveryPrice;
    
    const order = {
        id: Date.now(),
        product: selectedProduct,
        customer: {
            name: customerName,
            phone: customerPhone,
            state: customerState
        },
        deliveryType: deliveryType,
        deliveryPrice: deliveryPrice,
        totalPrice: totalPrice,
        date: new Date().toLocaleString('ar-DZ')
    };
    
    orders.push(order);
    
    await saveOrders(orders);
    
    alert('تم تأكيد الطلب بنجاح! سيتم التواصل معك قريباً');
    closeOrderModal();
}

async function deleteOrder(orderId) {
    if (confirm('هل أنت متأكد من حذف هذا الطلب؟')) {
        orders = orders.filter(o => o.id !== orderId);
        await saveOrders(orders);
        displayOrders();
    }
}

function displayOrders() {
    const ordersList = document.getElementById('ordersList');
    
    if (orders.length === 0) {
        ordersList.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">لا توجد طلبات حتى الآن</p>';
        return;
    }
    
    ordersList.innerHTML = '';
    
    orders.forEach(order => {
        const deliveryTypeText = order.deliveryType === 'home' ? 'المنزل' : 'المكتب';
        
        const orderItem = `
            <div class="order-item" style="background: white; padding: 20px; border-radius: 15px; margin-bottom: 15px; box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);">
                <div class="order-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <span class="order-id" style="font-weight: bold; color: #667eea;">طلب رقم: ${order.id}</span>
                    <button class="delete-btn" onclick="deleteOrder(${order.id})" style="background: #e74c3c; color: white; border: none; padding: 8px 15px; border-radius: 20px; cursor: pointer;">حذف</button>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 15px;">
                    <div>
                        <strong>المنتج:</strong> ${order.product.name}<br>
                        <strong>السعر:</strong> ${order.product.price} دج<br>
                        <strong>التوصيل:</strong> ${order.deliveryPrice} دج<br>
                        <strong style="color: #e74c3c;">المجموع:</strong> ${order.totalPrice} دج
                    </div>
                    <div>
                        <strong>العميل:</strong> ${order.customer.name}<br>
                        <strong>الهاتف:</strong> ${order.customer.phone}<br>
                        <strong>الولاية:</strong> ${order.customer.state}<br>
                        <strong>نوع التوصيل:</strong> ${deliveryTypeText}
                    </div>
                </div>
                <div style="padding-top: 15px; border-top: 1px solid #eee; color: #666;">
                    <strong>التاريخ:</strong> ${order.date}
                </div>
            </div>
        `;
        ordersList.innerHTML += orderItem;
    });
}

// ===================
// Admin Panel
// ===================

function toggleAdmin() {
    const adminLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true' || 
                         localStorage.getItem('adminLoggedIn') === 'true';
    
    if (adminLoggedIn) {
        const panel = document.getElementById('adminPanel');
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        if (panel.style.display === 'block') {
            loadAdminData();
            // التمرير إلى لوحة التحكم
            panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    } else {
        const password = prompt('كلمة المرور:');
        if (password === 'admin123') {
            sessionStorage.setItem('adminLoggedIn', 'true');
            const panel = document.getElementById('adminPanel');
            panel.style.display = 'block';
            loadAdminData();
            // التمرير إلى لوحة التحكم
            panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (password !== null) {
            alert('كلمة مرور خاطئة!');
        }
    }
}

function adminLogout() {
    if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
        sessionStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminLoggedIn');
        document.getElementById('adminPanel').style.display = 'none';
        alert('تم تسجيل الخروج بنجاح');
    }
}

function showAdminTab(tabName) {
    const tabs = document.querySelectorAll('.admin-tab');
    const contents = document.querySelectorAll('.admin-content');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    contents.forEach(content => content.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(tabName + '-content').classList.add('active');
    
    if (tabName === 'delivery') {
        loadDeliveryStates();
    } else if (tabName === 'orders') {
        displayOrders();
    } else if (tabName === 'products') {
        displayAdminProducts();
    }
}

function displayAdminProducts() {
    const list = document.getElementById('adminProductsList');
    list.innerHTML = '<h4>المنتجات الحالية:</h4>';

    products.forEach(product => {
        const productItem = `
            <div class="order-item">
                <div class="order-header" style="justify-content: space-between; display: flex;">
                    <span class="order-id">${product.name} - ${product.price} دج</span>
                    <button class="delete-btn" onclick="deleteProduct(${product.id})" style="background: #e74c3c; color: white; border: none; padding: 8px 15px; border-radius: 20px; cursor: pointer;">حذف</button>
                </div>
                <p>${product.description}</p>
                <p><strong>عدد الصور:</strong> ${product.images ? product.images.length : 0}</p>
            </div>
        `;
        list.innerHTML += productItem;
    });
}

function loadAdminData() {
    displayAdminProducts();
    loadDeliveryStates();
    displayOrders();
}

function showProductDetails(productId) {
    selectedProduct = products.find(p => p.id === productId);
    const modal = document.getElementById('productDetailsModal');
    
    document.getElementById('detailsProductName').textContent = selectedProduct.name;
    document.getElementById('detailsProductPrice').textContent = selectedProduct.price + ' دج';
    document.getElementById('detailsProductDescription').textContent = selectedProduct.description;
    
    const stars = '★'.repeat(selectedProduct.rating) + '☆'.repeat(5 - selectedProduct.rating);
    document.getElementById('detailsProductRating').innerHTML = `
        <span class="stars">${stars}</span>
        <span>(${selectedProduct.rating}/5)</span>
    `;
    
    const imageContainer = document.getElementById('detailsImageContainer');
    let imagesHtml = '';

    if (selectedProduct.images && selectedProduct.images.length > 0) {
        selectedProduct.images.forEach((image, index) => {
            imagesHtml += `<img src="${image}" alt="${selectedProduct.name}" class="product-image ${index === 0 ? 'active' : ''}">`;
        });
    }

    imageContainer.innerHTML = imagesHtml;

    document.getElementById('detailsOrderBtn').onclick = () => {
        closeProductDetails();
        openOrderModal(productId);
    };

    modal.style.display = 'block';
}

function closeProductDetails() {
    document.getElementById('productDetailsModal').style.display = 'none';
}

// ===================
// التهيئة الأولية
// ===================

document.addEventListener('DOMContentLoaded', async function() {
    // تهيئة البيانات
    await initializeDeliveryPrices();
    await initializeProducts();
    await initializeOrders();
    updateImageInputs();

    // معالج إرسال الطلب
    document.getElementById('orderForm').addEventListener('submit', submitOrder);

    // معالج البحث
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchProducts();
        }
    });

    // التحقق من معاملات URL لفتح لوحة التحكم
    const urlParams = new URLSearchParams(window.location.search);
    const adminParam = urlParams.get('admin') === 'true';
    const loginSuccess = urlParams.get('loginSuccess') === 'true';
    const autoLogin = urlParams.get('autoLogin') === 'true';
    
    // التحقق من حالة تسجيل الدخول
    const adminLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true' || 
                         localStorage.getItem('adminLoggedIn') === 'true';
    
    // إذا كان المدير مسجل دخول وجاء من صفحة الـ admin أو تم تسجيل الدخول للتو
    if (adminLoggedIn && (adminParam || loginSuccess || autoLogin)) {
        console.log('فتح لوحة التحكم...');
        
        // تأخير بسيط للتأكد من تحميل جميع العناصر
        setTimeout(() => {
            const panel = document.getElementById('adminPanel');
            if (panel) {
                panel.style.display = 'block';
                loadAdminData();
                
                // التمرير إلى لوحة التحكم
                setTimeout(() => {
                    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
                
                console.log('✅ تم فتح لوحة التحكم بنجاح');
            } else {
                console.error('❌ لم يتم العثور على لوحة التحكم');
            }
        }, 500);
    }

    // إغلاق النوافذ المنبثقة عند النقر خارجها
    window.addEventListener('click', function(event) {
        const orderModal = document.getElementById('orderModal');
        const detailsModal = document.getElementById('productDetailsModal');
        
        if (event.target === orderModal) {
            closeOrderModal();
        }
        if (event.target === detailsModal) {
            closeProductDetails();
        }
    });
    
    console.log('✅ تم تحميل الموقع بنجاح');
});
