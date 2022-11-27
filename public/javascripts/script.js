//console.log('1');
//document.querySelector("body").style.background-color='rgb(255, 222, 162)';
//document.getElementById("pas").style.color = "blue";
//document.querySelector("body").style.backgroundColor = 'rgb(255, 222, 162)';

        const togglePassword = document.querySelector("#togglePassword");
        const password = document.querySelector("#pas");
        if(togglePassword){
        togglePassword.style.left=password.offsetWidth-25+"px";
//console.log(password.offsetWidth);
        togglePassword.addEventListener("click", function () {
            // toggle the type attribute
            const type = password.getAttribute("type") === "password" ? "text" : "password";
            password.setAttribute("type", type);
            
            // toggle the icon
            this.classList.toggle("bi-eye");
        });
        }
//https://www.javascripttutorial.net/javascript-dom/javascript-toggle-password-visibility/