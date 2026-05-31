const quotes = [
    "逆天说法很有说法",
    "我们脊蛙是这样的",
    "人不行别怪路不平",
    "朝笑",
    "德育是善行和善意的闭环————LZB",
    "逆天",
    "JERRY",
    "电阻太唐了😂"
];

let lastQuotes = []; // 用于存储上一次引语的索引

function getRandomQuote() {
    if (lastQuotes.length === quotes.length) {
        lastQuotes = []; // 如果所有引语都已显示过，重置
    }

    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * quotes.length);
    } while (lastQuotes.includes(randomIndex)); // 确保新索引未在以前的索引中

    lastQuotes.push(randomIndex); // 更新已显示过的索引

    const quoteDisplay = document.getElementById('quoteDisplay');

    // 临时添加隐藏类来触发过渡
    quoteDisplay.classList.add('hidden');

    // 等待过渡完成
    setTimeout(() => {
        quoteDisplay.innerText = quotes[randomIndex];
        quoteDisplay.style.height = 'auto'; // 重置高度为自动，以匹配内容
        quoteDisplay.offsetHeight; // 强制浏览器重新计算高度
        quoteDisplay.style.height = '100px'; // 重新设置最大高度（如果需要）
        quoteDisplay.classList.remove('hidden'); // 移除隐藏类以触发淡入
    }, 500); // 与CSS中的过渡时间相匹配
}

window.onload = getRandomQuote; // 页面加载时显示一句随机引语
