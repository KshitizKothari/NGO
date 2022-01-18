const form = document.getElementById('form');
const username = document.getElementById('username');
const age = document.getElementById('age');
const phone = document.getElementById('phone');
const address = document.getElementById('address');
const govtId = document.getElementById('govtId')
const email = document.getElementById('email');
const password = document.getElementById('password');
const password2 = document.getElementById('password2');

form.addEventListener('submit', e => {
    // e.preventDefault();

    if(!validateInputs()){
        e.preventDefault();
    }
});

const setError = (element, message) => {
    const inputControl = element.parentElement;
    const errorDisplay = inputControl.querySelector('.error');

    errorDisplay.innerText = message;
    inputControl.classList.add('error');
    inputControl.classList.remove('success')
}

const setSuccess = element => {
    const inputControl = element.parentElement;
    const errorDisplay = inputControl.querySelector('.error');

    errorDisplay.innerText = '';
    inputControl.classList.add('success');
    inputControl.classList.remove('error');
};

const isValidEmail = email => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}



const validateInputs = () => {
    var isValidated= true;
    const usernameValue = username.value.trim();
    const ageValue = age.value.trim();
    const phoneValue = phone.value.trim();
    const addressValue = address.value.trim();
    const govtIdValue = govtId.value;
    const emailValue = email.value.trim();
    const passwordValue = password.value.trim();
    const password2Value = password2.value.trim();

    if(usernameValue === '') {
        setError(username,'Name is required');
        isValidated = false;
    } else {
        setSuccess(govtId);
    }

    if(govtIdValue.length!=12){
        setError(govtId, "Government id should be 12 digit number" );
        isValidated = false;
    }else{
        setSuccess(username);
    }

    if(ageValue === '') {
        setError(age, 'Age is required');
        isValidated = false;
    } else if((ageValue < 0) || (ageValue > 120)){
        setError(age, 'Provide a valid age');
        isValidated = false;
    } else {
        setSuccess(age);
    }

    if(phoneValue === '') {
        setError(phone, 'Phone number is required');
        isValidated = false;
    } else if (phoneValue.length != 10) {
        setError(phone, 'Provide a valid phone number');
        isValidated = false;
    } else {
        setSuccess(phone);
    }

    if(addressValue === '') {
        setError(address, 'Address is required');
        isValidated = false;
    } else {
        setSuccess(address);
    }

    if(emailValue === '') {
        setError(email, 'Email is required');
        isValidated = false;
    } else if (!isValidEmail(emailValue)) {
        setError(email, 'Provide a valid email address');
        isValidated = false;
    } else {
        setSuccess(email);
    }

    if(passwordValue === '') {
        setError(password, 'Password is required');
        isValidated = false;
    } else if (passwordValue.length < 8 ) {
        setError(password, 'Password must be at least 8 character.');
        isValidated = false;
    } else {
        setSuccess(password);
    }

    if(password2Value === '') {
        setError(password2, 'Please confirm your password');
        isValidated = false;
    } else if (password2Value !== passwordValue) {
        setError(password2, "Passwords doesn't match");
        isValidated = false;
    } else {
        setSuccess(password2);
    }
    return isValidated;
};
