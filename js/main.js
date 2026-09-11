document.addEventListener("DOMContentLoaded", () => {
    const sections = document.querySelectorAll(".container h2[id]");
    const navItems = document.querySelectorAll(".category-item");
    const nav = document.getElementById("category-nav");
    const scrollLeftIndicator = document.getElementById("scroll-left");
    const scrollRightIndicator = document.getElementById("scroll-right");

    navItems.forEach(item => {
        item.addEventListener("click", function() {
            navItems.forEach(nav => nav.classList.remove("active"));
            this.classList.add("active");
        });
    });

    const observerOptions = {
        root: null,
        rootMargin: "-20% 0px -60% 0px",
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute("id");
                navItems.forEach((item) => {
                    if (item.getAttribute("data-target") === id) {
                        item.classList.add("active");
                    } else {
                        item.classList.remove("active");
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach((section) => {
        observer.observe(section);
    });

    // Control dinámico de flechas indicadoras en la barra de categorías móvil
    function updateScrollIndicators() {
        if (!nav) return;
        const scrollLeft = nav.scrollLeft;
        const maxScrollLeft = nav.scrollWidth - nav.clientWidth;

        if (scrollLeft > 10) {
            scrollLeftIndicator.classList.add("show");
        } else {
            scrollLeftIndicator.classList.remove("show");
        }

        if (scrollLeft < maxScrollLeft - 10) {
            scrollRightIndicator.classList.add("show");
        } else {
            scrollRightIndicator.classList.remove("show");
        }
    }

    if (nav) {
        nav.addEventListener("scroll", updateScrollIndicators);
        window.addEventListener("resize", updateScrollIndicators);
        setTimeout(updateScrollIndicators, 100);
    }
});

function updateQty(button, change) {
    const card = button.closest('.menu-card');
    const qtySpan = card.querySelector('.qty-count');
    let currentQty = parseInt(qtySpan.textContent);
    
    currentQty += change;
    if (currentQty < 0) currentQty = 0;
    
    qtySpan.textContent = currentQty;

    const optionType = card.getAttribute('data-option-type');
    const hasEntrada = card.hasAttribute('data-option-entrada');
    const optionsContainer = card.querySelector('.item-options-container');

    if ((optionType || hasEntrada) && optionsContainer) {
        if (currentQty > 0 && optionsContainer.innerHTML.trim() === '') {
            renderOptions(optionsContainer, optionType, hasEntrada);
            optionsContainer.style.display = 'block';
        } else if (currentQty === 0) {
            optionsContainer.style.display = 'none';
            optionsContainer.innerHTML = '';
        }
    }

    calculateTotal();
}

function renderOptions(container, type, hasEntrada) {
    let html = '';

    if (hasEntrada) {
        html += `
            <div class="single-option-group">
                <label>Entrada:</label>
                <select class="opt-entrada" onchange="calculateTotal()">
                    <option value="Sopa Wantan">Sopa Wantán</option>
                    <option value="Wantan Frito">Wantán Frito</option>
                </select>
            </div>
        `;
    }

    if (type === 'arroz') {
        html += `
            <div class="single-option-group">
                <label>Cambio de Arroz:</label>
                <select class="opt-arroz" onchange="calculateTotal()">
                    <option value="blanco">Arroz blanco (Estándar)</option>
                    <option value="chaufa">Cambiar a arroz chaufa (+S/ 1.00)</option>
                </select>
            </div>
        `;
    } else if (type === 'fideo') {
        html += `
            <div class="single-option-group">
                <label>Tipo de Fideo:</label>
                <select class="opt-fideo" onchange="calculateTotal()">
                    <option value="sancochado">Fideo sancochado (S/ 0.00)</option>
                    <option value="frito">Cambiar a fideo frito (+S/ 1.00)</option>
                </select>
            </div>
        `;
    }

    container.innerHTML = html;
}

function calculateTotal() {
    const cards = document.querySelectorAll('.menu-card');
    let totalItems = 0;
    let totalPrice = 0;
    let totalContainers = 0; 
    let orderDetails = [];

    cards.forEach(card => {
        const qty = parseInt(card.querySelector('.qty-count').textContent);
        if (qty > 0) {
            const name = card.getAttribute('data-name');
            let basePrice = parseFloat(card.getAttribute('data-price'));
            const category = card.getAttribute('data-category');
            
            let itemExtra = 0;
            let optionsText = [];

            const optArroz = card.querySelector('.opt-arroz');
            if (optArroz && optArroz.value === 'chaufa') {
                itemExtra += 1.00;
                optionsText.push("Cambio a Chaufa (+S/ 1.00)");
            }

            const optFideo = card.querySelector('.opt-fideo');
            if (optFideo && optFideo.value === 'frito') {
                itemExtra += 1.00;
                optionsText.push("Cambio a Fideo Frito (+S/ 1.00)");
            }

            const optEntrada = card.querySelector('.opt-entrada');
            if (optEntrada) {
                optionsText.push(`Entrada: ${optEntrada.value}`);
            }

            const finalItemPrice = basePrice + itemExtra;
            totalPrice += finalItemPrice * qty;
            totalItems += qty;

            if (category === 'plato' || category === 'entrada') {
                totalContainers += qty;
            }

            let desc = `${qty}x ${name}`;
            if (optionsText.length > 0) {
                desc += ` (${optionsText.join(', ')})`;
            }
            orderDetails.push(desc);
        }
    });

    const taperCost = totalContainers * 1.00;
    totalPrice += taperCost;

    document.getElementById('items-count').textContent = `${totalItems} producto${totalItems !== 1 ? 's' : ''} seleccionado${totalItems !== 1 ? 's' : ''}`;
    document.getElementById('taper-extra').textContent = `+ S/ ${taperCost.toFixed(2)} por táper`;
    document.getElementById('total-price').textContent = `S/ ${totalPrice.toFixed(2)}`;

    const wspBtn = document.getElementById('wsp-btn');
    if (totalItems > 0) {
        wspBtn.removeAttribute('disabled');
    } else {
        wspBtn.setAttribute('disabled', 'true');
    }
}

function copyYapeNumber() {
    const yapeNumber = "993970824";
    
    navigator.clipboard.writeText(yapeNumber).then(() => {
        showYapeToast(`¡Número copiado (${yapeNumber})! Ya puedes Yapear.`);
    }).catch(err => {
        console.error('Error al copiar el número: ', err);
    });
}

function showYapeToast(message) {
    let toast = document.getElementById('yape-toast-notification');
    
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'yape-toast-notification';
        toast.className = 'yape-toast';
        document.body.appendChild(toast);
    }
    
    toast.textContent = message;
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function sendOrder() {
    const cards = document.querySelectorAll('.menu-card');
    let itemsList = "";
    let totalFoodPrice = 0;
    let totalTaperCharge = 0;

    cards.forEach(card => {
        const qty = parseInt(card.querySelector('.qty-count').textContent);
        const name = card.dataset.name;
        const price = parseFloat(card.dataset.price);
        const category = card.dataset.category;
        const container = card.querySelector('.item-options-container');

        if (qty > 0) {
            let itemExtra = 0;
            let optionsText = [];

            if (container && container.style.display !== 'none') {
                const optArroz = card.querySelector('.opt-arroz');
                if (optArroz && optArroz.value === 'chaufa') {
                    itemExtra += 1.00;
                    optionsText.push("Cambio a Chaufa (+S/ 1.00)");
                }

                const optFideo = card.querySelector('.opt-fideo');
                if (optFideo && optFideo.value === 'frito') {
                    itemExtra += 1.00;
                    optionsText.push("Cambio a Fideo Frito (+S/ 1.00)");
                }

                const optEntrada = card.querySelector('.opt-entrada');
                if (optEntrada) {
                    optionsText.push(`Entrada: ${optEntrada.value}`);
                }
            }

            const unitPrice = price + itemExtra;
            const subtotalItem = unitPrice * qty;
            totalFoodPrice += subtotalItem;

            let detailString = optionsText.length > 0 ? ` (${optionsText.join(', ')})` : '';
            itemsList += `• ${qty}x ${name}${detailString} - S/ ${subtotalItem.toFixed(2)}\n`;

            if (category === 'plato' || category === 'entrada') {
                totalTaperCharge += qty * 1.00;
            }
        }
    });

    const grandTotal = totalFoodPrice + totalTaperCharge;

    let message = `¡Hola! \nQuisiera realizar el siguiente pedido para llevar:\n\n${itemsList}`;
    
    if (totalTaperCharge > 0) {
        message += `• Costo de táper: S/ ${totalTaperCharge.toFixed(2)}\n`;
    }

    message += `\n*Total a pagar:* S/ ${grandTotal.toFixed(2)}\n\nPor favor confirmen el tiempo de entrega. ¡Gracias!`;

    let encodedMessage = encodeURIComponent(message);
    const phoneOwner = "993970824";
    window.open(`https://wa.me/${phoneOwner}?text=${encodedMessage}`, '_blank');
}