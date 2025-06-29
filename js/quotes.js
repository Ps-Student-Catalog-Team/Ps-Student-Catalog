const quotes = [
    "Success is not final, failure is not fatal: It is the courage to continue that counts. - Winston S. Churchill",
    "Life is like riding a bicycle. To keep your balance, you must keep moving. - Albert Einstein",
    "Ask not what your country can do for you - ask what you can do for your country. - John F. Kennedy",
    "The only limit to our realization of tomorrow is our doubts of today. - Franklin D. Roosevelt",
    "Be the change you wish to see in the world. - Mahatma Gandhi",
    "An investment in knowledge pays the best interest. - Benjamin Franklin",
    "The greatest glory in living lies not in never falling, but in rising every time we fall. - Oliver Goldsmith",
    "Do not watch the clock. Do what it does. Keep going. - Sam Levenson",
    "Happiness is not something ready made. It comes from your own actions. - Dalai Lama",
    "Imagination is more important than knowledge. For knowledge is limited, whereas imagination embraces the entire world, stimulating progress, giving birth to evolution. - Albert Einstein",
    "Have the courage to follow your heart and intuition. They somehow already know what you truly want to become. - Steve Jobs",
    "In the middle of every difficulty lies opportunity. - Albert Einstein",
    "All that we are is the result of what we have thought. The mind is everything. What we think we become. - Buddha",
    "The greatest way to live with honor in this world is to be what we pretend to be. - Socrates",
    "Dream big and dare to fail. - Norman Vincent Peale",
    "The best way to predict your future is to create it. - Peter Drucker",
    "You miss 100% of the shots you don't take. - Wayne Gretzky",
    "It does not matter how slowly you go as long as you do not stop. - Confucius",
    "Everything you’ve ever wanted is on the other side of fear. - George Addair",
    "The only way to do great work is to love what you do. - Steve Jobs",
    "Your time is limited, don’t waste it living someone else’s life. - Steve Jobs",
    "Act as if what you do makes a difference. It does. - William James",
    "Success usually comes to those who are too busy to be looking for it. - Henry David Thoreau",
    "Don’t count the days, make the days count. - Muhammad Ali",
    "What lies behind us and what lies before us are tiny matters compared to what lies within us. - Ralph Waldo Emerson",
    "Believe you can and you’re halfway there. - Steve Jobs",
];

function getRandomQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quoteDisplay = document.getElementById('quoteDisplay');

    // 临时添加隐藏类来触发过渡
    quoteDisplay.classList.add('hidden');

    // 等待过渡完成（使用setTimeout模拟，或使用transitionend事件监听）
    setTimeout(() => {
        quoteDisplay.innerText = quotes[randomIndex];
        quoteDisplay.style.height = 'auto'; // 重置高度为自动，以匹配内容
        quoteDisplay.offsetHeight; // 强制浏览器重新计算高度
        quoteDisplay.style.height = '100px'; // 重新设置最大高度（如果需要）
        quoteDisplay.classList.remove('hidden'); // 移除隐藏类以触发淡入
    }, 500); // 与CSS中的过渡时间相匹配
}

window.onload = getRandomQuote; // 页面加载时显示一句随机引语