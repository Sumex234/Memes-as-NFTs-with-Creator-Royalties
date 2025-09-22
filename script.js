let walletConnected = false;
let userAddress = null;
let contractAddress = 'ST1234567890ABCDEF.memes-as-nfts-for-creators';

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

async function connectWallet() {
    try {
        if (typeof window.blockstack !== 'undefined') {
            walletConnected = true;
            userAddress = 'ST1234567890EXAMPLE';
            document.querySelector('.connect-btn').textContent = 'Connected';
            showNotification('Wallet connected successfully!');
            loadUserProfile();
        } else {
            showNotification('Please install Hiro Wallet or Xverse', 'error');
        }
    } catch (error) {
        showNotification('Failed to connect wallet', 'error');
    }
}

async function mintMeme(event) {
    event.preventDefault();
    
    if (!walletConnected) {
        showNotification('Please connect your wallet first', 'error');
        return;
    }
    
    const formData = new FormData(event.target);
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const imageUrl = document.getElementById('imageUrl').value;
    const royalty = parseFloat(document.getElementById('royalty').value);
    const tags = document.getElementById('tags').value;
    
    if (royalty > 10) {
        showNotification('Royalty cannot exceed 10%', 'error');
        return;
    }
    
    try {
        const royaltyBasisPoints = Math.floor(royalty * 100);
        
        const memeData = {
            title,
            description,
            imageUrl,
            royalty: royaltyBasisPoints,
            tags,
            creator: userAddress,
            timestamp: Date.now()
        };
        
        const tokenId = await simulateMint(memeData);
        
        showNotification(`Meme NFT minted successfully! Token ID: ${tokenId}`);
        event.target.reset();
        loadMemes();
    } catch (error) {
        showNotification('Failed to mint NFT', 'error');
    }
}

async function simulateMint(memeData) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const tokenId = Math.floor(Math.random() * 10000) + 1;
            const existingMemes = JSON.parse(localStorage.getItem('memes') || '[]');
            existingMemes.push({
                id: tokenId,
                ...memeData,
                price: null,
                likes: 0,
                viralScore: 0
            });
            localStorage.setItem('memes', JSON.stringify(existingMemes));
            resolve(tokenId);
        }, 1000);
    });
}

async function loadMemes() {
    const memeGrid = document.getElementById('memeGrid');
    const memes = JSON.parse(localStorage.getItem('memes') || '[]');
    
    if (memes.length === 0) {
        memeGrid.innerHTML = '<div class="no-memes">No memes found. Be the first to mint!</div>';
        return;
    }
    
    memeGrid.innerHTML = memes.map(meme => `
        <div class="meme-card" onclick="showMemeDetails(${meme.id})">
            <img src="${meme.imageUrl}" alt="${meme.title}" class="meme-image" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZjBmMGYwIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5IiBmb250LXNpemU9IjE0Ij5JbWFnZSBub3QgZm91bmQ8L3RleHQ+Cjwvc3ZnPgo='">
            <div class="meme-info">
                <div class="meme-title">${meme.title}</div>
                <div class="meme-description">${meme.description}</div>
                <div class="meme-stats">
                    <span>❤️ ${meme.likes}</span>
                    <span>🔥 ${meme.viralScore}</span>
                    <span>💰 ${meme.royalty/100}%</span>
                </div>
                ${meme.price ? `
                    <div class="meme-price">${meme.price} STX</div>
                    <button class="buy-btn" onclick="buyMeme(${meme.id}, event)">Buy Now</button>
                ` : '<div class="meme-price">Not for sale</div>'}
            </div>
        </div>
    `).join('');
}

async function searchMemes() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const memes = JSON.parse(localStorage.getItem('memes') || '[]');
    
    const filteredMemes = memes.filter(meme => 
        meme.title.toLowerCase().includes(searchTerm) ||
        meme.description.toLowerCase().includes(searchTerm) ||
        meme.tags.toLowerCase().includes(searchTerm)
    );
    
    const memeGrid = document.getElementById('memeGrid');
    
    if (filteredMemes.length === 0) {
        memeGrid.innerHTML = '<div class="no-memes">No memes found matching your search.</div>';
        return;
    }
    
    memeGrid.innerHTML = filteredMemes.map(meme => `
        <div class="meme-card" onclick="showMemeDetails(${meme.id})">
            <img src="${meme.imageUrl}" alt="${meme.title}" class="meme-image" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZjBmMGYwIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5IiBmb250LXNpemU9IjE0Ij5JbWFnZSBub3QgZm91bmQ8L3RleHQ+Cjwvc3ZnPgo='">
            <div class="meme-info">
                <div class="meme-title">${meme.title}</div>
                <div class="meme-description">${meme.description}</div>
                <div class="meme-stats">
                    <span>❤️ ${meme.likes}</span>
                    <span>🔥 ${meme.viralScore}</span>
                    <span>💰 ${meme.royalty/100}%</span>
                </div>
                ${meme.price ? `
                    <div class="meme-price">${meme.price} STX</div>
                    <button class="buy-btn" onclick="buyMeme(${meme.id}, event)">Buy Now</button>
                ` : '<div class="meme-price">Not for sale</div>'}
            </div>
        </div>
    `).join('');
}

function showMemeDetails(tokenId) {
    const memes = JSON.parse(localStorage.getItem('memes') || '[]');
    const meme = memes.find(m => m.id === tokenId);
    
    if (!meme) return;
    
    const modal = document.getElementById('memeModal');
    const details = document.getElementById('memeDetails');
    
    details.innerHTML = `
        <div class="meme-detail">
            <img src="${meme.imageUrl}" alt="${meme.title}" style="width: 100%; max-height: 300px; object-fit: cover; border-radius: 10px; margin-bottom: 1rem;" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZjBmMGYwIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5IiBmb250LXNpemU9IjE0Ij5JbWFnZSBub3QgZm91bmQ8L3RleHQ+Cjwvc3ZnPgo='">
            <h3>${meme.title}</h3>
            <p>${meme.description}</p>
            <div class="meme-meta">
                <p><strong>Token ID:</strong> ${meme.id}</p>
                <p><strong>Creator:</strong> ${meme.creator}</p>
                <p><strong>Royalty:</strong> ${meme.royalty/100}%</p>
                <p><strong>Tags:</strong> ${meme.tags}</p>
                <p><strong>Likes:</strong> ${meme.likes}</p>
                <p><strong>Viral Score:</strong> ${meme.viralScore}</p>
            </div>
            <div class="meme-actions">
                <button onclick="likeMeme(${meme.id})" class="like-btn">❤️ Like</button>
                ${meme.price ? `
                    <button onclick="buyMeme(${meme.id})" class="buy-btn">Buy for ${meme.price} STX</button>
                ` : ''}
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('memeModal').style.display = 'none';
}

async function buyMeme(tokenId, event) {
    if (event) event.stopPropagation();
    
    if (!walletConnected) {
        showNotification('Please connect your wallet first', 'error');
        return;
    }
    
    const memes = JSON.parse(localStorage.getItem('memes') || '[]');
    const meme = memes.find(m => m.id === tokenId);
    
    if (!meme || !meme.price) {
        showNotification('Meme not available for purchase', 'error');
        return;
    }
    
    try {
        const updatedMemes = memes.map(m => {
            if (m.id === tokenId) {
                return {
                    ...m,
                    price: null,
                    viralScore: m.viralScore + 1
                };
            }
            return m;
        });
        
        localStorage.setItem('memes', JSON.stringify(updatedMemes));
        showNotification(`Successfully purchased ${meme.title}!`);
        closeModal();
        loadMemes();
    } catch (error) {
        showNotification('Failed to purchase meme', 'error');
    }
}

async function likeMeme(tokenId) {
    const memes = JSON.parse(localStorage.getItem('memes') || '[]');
    const updatedMemes = memes.map(m => {
        if (m.id === tokenId) {
            return {
                ...m,
                likes: m.likes + 1,
                viralScore: m.viralScore + 1
            };
        }
        return m;
    });
    
    localStorage.setItem('memes', JSON.stringify(updatedMemes));
    showNotification('Meme liked!');
    closeModal();
    loadMemes();
}

async function createProfile(event) {
    event.preventDefault();
    
    if (!walletConnected) {
        showNotification('Please connect your wallet first', 'error');
        return;
    }
    
    const username = document.getElementById('username').value;
    const bio = document.getElementById('bio').value;
    
    const profile = {
        username,
        bio,
        address: userAddress,
        joinedAt: Date.now()
    };
    
    localStorage.setItem('userProfile', JSON.stringify(profile));
    showNotification('Profile created successfully!');
    loadUserProfile();
    event.target.reset();
}

async function loadUserProfile() {
    const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    const memes = JSON.parse(localStorage.getItem('memes') || '[]');
    const userMemes = memes.filter(m => m.creator === userAddress);
    
    const statsDiv = document.getElementById('profileStats');
    
    if (profile.username) {
        statsDiv.innerHTML = `
            <h3>Profile Stats</h3>
            <div class="stat-item">
                <span>Username:</span>
                <span>${profile.username}</span>
            </div>
            <div class="stat-item">
                <span>Bio:</span>
                <span>${profile.bio || 'No bio set'}</span>
            </div>
            <div class="stat-item">
                <span>Total Memes:</span>
                <span>${userMemes.length}</span>
            </div>
            <div class="stat-item">
                <span>Total Likes:</span>
                <span>${userMemes.reduce((sum, m) => sum + m.likes, 0)}</span>
            </div>
            <div class="stat-item">
                <span>Viral Score:</span>
                <span>${userMemes.reduce((sum, m) => sum + m.viralScore, 0)}</span>
            </div>
        `;
    } else {
        statsDiv.innerHTML = '<p>Create a profile to see your stats</p>';
    }
}

window.onclick = function(event) {
    const modal = document.getElementById('memeModal');
    if (event.target === modal) {
        closeModal();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    loadMemes();
    
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchMemes();
        }
    });
});
