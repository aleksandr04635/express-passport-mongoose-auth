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
//^ https://www.javascripttutorial.net/javascript-dom/javascript-toggle-password-visibility/

const comForm = document.querySelectorAll('.comform');
comForm.forEach((form)=> {
        //form.style.backgroundColor="blue";
        //form.style.visibility="hidden";
        form.style.display="none";
        //form.nextSibling.style.display="none";
        //console.log(form.id);
})
const comFormToggle = document.querySelectorAll('.comformtoggle');
comFormToggle.forEach((button)=> {
        button.addEventListener('click',  ()=> {
            //    this.switch=!this.switch;
//button.style.color="red";
//button.nextSibling.visibility="visible";
//button.nextSibling.style.color="red";
//button.nextSibling.style.backgroundColor="red";
//button.style.visibility="hidden";
//button.nextSibling.style.visibility="visible";
//button.style.display="none";
                button.nextSibling.style.display= ( button.nextSibling.style.display =="none") ? "block": "none";
        })
})

const user=document.getElementById('great').textContent.slice(8);
//console.log("aut="+user);
const authorsLines = document.querySelectorAll('.author');
authorsLines.forEach((par)=> {
 let link=par.querySelector('a')  ;
 //link.textContent= link.textContent+"add";
 let curAut = link.textContent;   
 //console.log(curAut);
 if (curAut==user)  {
       // par.style.color="red";
       par.classList.add("author-user");
 }   
})

//shows form for editing and error warning only for necessary comment -
// passed from server in id='commented-to-el' element
const commentedTo=document.getElementById('commented-to-el').textContent.slice(0,24).toString();
if (commentedTo){
  document.getElementById('commented-to-el').style.display="none";
console.log(":"+commentedTo+":");
//document.getElementById(CSS.escape(commentedTo)).style.display="block";
document.getElementById(commentedTo).style.display="block";
//document.getElementById(commentedTo).nextSibling.style.display="block";
}
//document.querySelector(`a[href=${CSS.escape(t)}]`)
//let t = window.location.pathname;
//console.log(t);