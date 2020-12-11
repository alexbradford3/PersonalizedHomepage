function setFooterText() {
    var node = document.createElement("p");
    var text = document.createTextNode("© Copyright " + new Date().getFullYear() + " Alex Bradford");
    node.appendChild(text);
    document.querySelector("#footer").appendChild(node); 
}

setFooterText();