window.onload = () => {
    const base64 = getBase64()
    const navtag = document.getElementsByTagName('nav')[0]
    const btnpng = navtag.children[0]
    const btnjpg = navtag.children[1]
    const btngif = navtag.children[2]

    // save some ram
    btnpng.addEventListener('click', () => {

        btnpng.href = "data:image/png;base64," + base64
    })
    btnjpg.addEventListener('click', () => {

        btnjpg.href = "data:image/jpeg;base64," + base64
    })
    btngif.addEventListener('click', () => {
        btngif.href = "data:image/gif;base64," + base64

    })
}

function getBase64() {
    let base64png = document.getElementById('screenshot').src
    return base64png.substring(22, base64png.length)
}