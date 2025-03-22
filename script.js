let cart = [];
let cartCount = document.getElementById('cart-count');
let cartItemsContainer = document.getElementById('cart-items');
let cartSubtotal = document.getElementById('cart-subtotal');
let cartShipping = document.getElementById('cart-shipping');
let cartTotal = document.getElementById('cart-total');
let map;
let marker;

  

// Variável para contar os cliques no cabeçalho
let clickCount = 0;

// Função para lidar com os cliques no cabeçalho
document.querySelector('header').addEventListener('click', function() {
    clickCount++; // Incrementa o contador de cliques

    // Verifica se o número de cliques chegou a 5
    if (clickCount >= 5) {
        // Torna o botão de login visível
        document.querySelector('.admin-btn').style.display = 'block';
    }
});


// Adiciona um item ao carrinho
function addToCart(productName, price) {
    cart.push({ name: productName, price: price });
    cartCount.textContent = cart.length;
    updateCartItems();
}

function showToast() {
    let toast = document.getElementById("toast");
    toast.classList.add("show");

    // Oculta a notificação após 2 segundos
    setTimeout(() => {
        toast.classList.remove("show");
    }, 5000);
}

// Função para remover um item do carrinho
function removeFromCart(index) {
    cart.splice(index, 1); // Remove o item do carrinho pelo índice
    cartCount.textContent = cart.length;
    updateCartItems(); // Atualiza a lista do carrinho
}

let shipping = 0;

      // Definindo a localização base (latitude e longitude de um CEP fictício)
      const baseLatitude = -3.819243; 
      const baseLongitude = -38.530701; 
      
              // Função para calcular a distância entre dois pontos com base em latitude e longitude
      function calcularDistancia(lat1, lon1, lat2, lon2) {
          const radlat1 = Math.PI * lat1 / 180;
          const radlat2 = Math.PI * lat2 / 180;
          const radlon1 = Math.PI * lon1 / 180;
          const radlon2 = Math.PI * lon2 / 180;
          const dlat = radlat2 - radlat1;
          const dlon = radlon2 - radlon1;
          const a = Math.sin(dlat / 2) * Math.sin(dlat / 2) +
                    Math.cos(radlat1) * Math.cos(radlat2) *
                    Math.sin(dlon / 2) * Math.sin(dlon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distancia = 6371 * c; // Raio da Terra em km
                  return distancia;
              }
      
              // Função para calcular o frete
              function calcularFrete() {
                  const cep = document.getElementById('cep').value.replace(/\D/g, ''); // Remover caracteres não numéricos
      
                  if (cep.length !== 8) {
                      alert("Por favor, digite um CEP válido.");
                      return;
                  }
      
                  // Substitua "YOUR_OPENCAGE_API_KEY" pela sua chave da OpenCage API
                  const openCageAPIKey = '58218a0c19974c569d02c72b3f40a756'; // Aqui você precisa da sua chave da API
                  const url = `https://api.opencagedata.com/geocode/v1/json?q=${cep},BR&key=${openCageAPIKey}`;
      
                  fetch(url)
                      .then(response => response.json())
                      .then(data => {
                          if (data.results.length === 0) {
                              alert("CEP não encontrado.");
                              return;
                          }
      
                          const location = data.results[0].geometry;
                          const lat = location.lat;
                          const lon = location.lng;
      
                          // Calcular a distância entre o CEP e a localização base
                          const distancia = calcularDistancia(baseLatitude, baseLongitude, lat, lon);

                          // Calcular o valor do frete
                          
                          if (distancia > 2) {
                            shipping = (distancia - 2) * 2; // Calcula o frete acima de 2 km
                        } else {
                            shipping = 0; // Frete grátis para até 2 km
                        }
                          updateCartItems(); // Atualiza os valores do carrinho após calcular o frete

                          // Exibir o valor do frete
                          document.getElementById('frete-taxado').textContent = `Taxa de Entrega: R$${shipping.toFixed(2)}`;
                      })
                      .catch(error => {
                          console.error("Erro ao consultar a OpenCage API:", error);
                          alert("Erro ao buscar o CEP. Tente novamente.");
                      });
              }


// Atualiza os itens do carrinho no modal
function updateCartItems() {
    cartItemsContainer.innerHTML = ''; // Limpa a lista de itens

    let subtotal = cart.reduce((total, item) => total + item.price, 0); // Calcula o subtotal

    cart.forEach((item, index) => {
        cartItemsContainer.innerHTML += `
            <div class="cart-item">
                <span class="cart-item-name">${item.name}</span>
                <span class="cart-item-price">R$${item.price.toFixed(2)}</span>
                <button onclick="removeFromCart(${index})">Remover</button> <!-- Botão de remoção -->
            </div>
        `;
    });

    // Exibe o subtotal, o frete e o total
    cartSubtotal.textContent = `R$${subtotal.toFixed(2)}`;
    cartShipping.textContent = `R$${shipping.toFixed(2)}`;
    cartTotal.textContent = `R$${(subtotal + shipping).toFixed(2)}`;
}

// Função para buscar o endereço automaticamente pelo CEP
function buscarEndereco() {
    const cep = document.getElementById('cep').value.replace(/\D/g, ''); // Remove tudo que não for número
    if (cep.length === 8) {
        fetch(`https://viacep.com.br/ws/${cep}/json/`)
            .then(response => response.json())
            .then(data => {
                if (data.erro) {
                    alert('CEP não encontrado.');
                } else {
                    document.getElementById('logradouro').value = data.logradouro;
                    document.getElementById('bairro').value = data.bairro;
                    document.getElementById('cidade').value = data.localidade;
                    document.getElementById('estado').value = data.uf;
                }
            })
            .catch(error => {
                console.error('Erro ao buscar o CEP:', error);
                alert('Erro ao buscar o endereço. Tente novamente.');
            });
    } else {
        alert('Por favor, insira um CEP válido.');
        
    }
}


 // Ao clicar no botão "Selecionar no Mapa", abre o modal
 document.getElementById('select-map-btn').addEventListener('click', function() {
    document.getElementById('map-modal').style.display = 'block';
    initMap(); // Inicializa o mapa
});

// Ao clicar no botão "Fechar", fecha o modal
document.getElementById('close-map-modal').addEventListener('click', function() {
    document.getElementById('map-modal').style.display = 'none';
});

// Inicializa o mapa
function initMap() {
    map = L.map('map').setView([ -23.55052, -46.633308 ], 13); // Posição inicial no mapa (São Paulo, Brasil)

    // Carregar o OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Criar o marcador e permitir mover
    marker = L.marker([ -3.8191941, -38.5305295 ]).addTo(map);
    marker.bindPopup("Selecione o local aqui").openPopup();

    // Adicionar o evento de click para colocar o marcador e preencher o formulário
    map.on('click', function(e) {
        let lat = e.latlng.lat;
        let lng = e.latlng.lng;
        marker.setLatLng([lat, lng]);

        // Buscar o endereço com o Nominatim API (OpenStreetMap)
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
            .then(response => response.json())
            .then(data => {
                if (data.address) {
                    document.getElementById('logradouro').value = data.address.road || '';
                    document.getElementById('bairro').value = data.address.neighbourhood || '';
                    document.getElementById('cidade').value = data.address.city || '';
                    document.getElementById('estado').value = data.address.state || '';
                    document.getElementById('cep').value = data.address.postcode || '';
                }
            })
            .catch(error => {
                console.error('Erro ao buscar o endereço:', error);
            });

        // Fecha o modal após selecionar o local
        document.getElementById('map-modal').style.display = 'none';
    });
}

// Abre o modal do carrinho
function openCart() {
    document.getElementById('cart-modal').style.display = 'flex';
}

// Fecha o modal do carrinho
function closeCart() {
    document.getElementById('cart-modal').style.display = 'none';
}

// Função de login do administrador
function openLoginModal() {
    document.getElementById('login-modal').style.display = 'flex';
}

function closeLoginModal() {
    document.getElementById('login-modal').style.display = 'none';
}

// Verifica o login do administrador
document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const username = document.getElementById('admin-user').value;
    const password = document.getElementById('admin-pass').value;

    if (username === 'admin' && password === 'admin123') {
        // Login bem-sucedido, exibe a área de pedidos
        alert('Login realizado com sucesso!');
        closeLoginModal();
        loadAdminOrders();  // Carrega os pedidos
    } else {
        alert('Usuário ou senha incorretos');
    }
});


// Armazena os pedidos no localStorage
document.getElementById('checkout-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const cpf = document.getElementById('cpf').value;
    const cep = document.getElementById('cep').value;
    const numero = document.getElementById('numero').value;
    const complemento = document.getElementById('complemento').value;
    const payment = document.getElementById('payment').value;

    // Validação dos campos
    if (!name || !cpf || !cep || !numero) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(cpf)) {
        console.log("CPF inválido!");
    }

    // Calcular o valor total dos itens
    const total = cart.reduce((total, item) => total + item.price, 0); // Valor fixo de frete
    const finalTotal = total + shipping;

    // Gerar a mensagem para WhatsApp
    const message = `
        *Pedido:*\n${cart.map(item => `    *- ${item.name}*`).join('\n\n')}

    *observacao:* *${document.getElementById('observacao').value}*
----------------------------------------------------
       \n*Total: R$${finalTotal.toFixed(2)}*\n
----------------------------------------------------
        \n*Informações do Cliente:*
        \nNome: ${name}
        \nCPF: ${cpf}
        \nCEP: ${cep}
        \nEndereço: ${document.getElementById('logradouro').value}, ${numero} - ${complemento}
        \nBairro: ${document.getElementById('bairro').value}
        \nCidade: ${document.getElementById('cidade').value}
        \nEstado: ${document.getElementById('estado').value}

----------------------------------------------------
        \n*Pagamento:* *${payment}*

----------------------------------------------------

    `;

    // Gerar o link do WhatsApp
    const whatsappLink = `https://wa.me/+5585998005021?text=${encodeURIComponent(message)}`;

    // Abrir o WhatsApp com a mensagem
    window.open(whatsappLink, '_blank');

    alert('Pedido enviado com sucesso!');

    // Limpar carrinho após o pedido
    cart = [];
    cartCount.textContent = 0;
    updateCartItems();
});

// Carrega os pedidos feitos para visualização do admin
function loadAdminOrders() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const tableBody = document.getElementById('orders-table').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = ''; // Limpa a tabela

    orders.forEach(order => {
        const row = tableBody.insertRow();
        row.insertCell(0).textContent = order.date;
        row.insertCell(1).textContent = order.cpf;
        row.insertCell(2).textContent = order.items.map(item => item.name).join(', ');
    });

    document.getElementById('admin-orders').style.display = 'flex';
}

// Fecha a visualização dos pedidos
function closeAdminOrders() {
    document.getElementById('admin-orders').style.display = 'none';
}
