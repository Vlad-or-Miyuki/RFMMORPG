function writeLine(text) {
    const newLine = document.createElement('p');
    newLine.textContent = text;
    consoleBody.appendChild(newLine);
    consoleBody.scrollTop = consoleBody.scrollHeight;
}