const form = document.getElementById('form');
const username = document.getElementById('username');
const age = document.getElementById('age');
const phone = document.getElementById('phone');
const govtId = document.getElementById('govtId');
const address = document.getElementById('address');
const qualification = document.getElementById('qualification');
const about = document.getElementById('about');
const email = document.getElementById('email');
const password = document.getElementById('password');
const password2 = document.getElementById('password2');

form.addEventListener('submit', e => {
    e.preventDefault();

    validateInputs();
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

const isValidPhone = phone => {
    const phoneno = /^[6-9]\d{9}$/;
    return phoneno;
}

const validateInputs = () => {
    const usernameValue = username.value.trim();
    const ageValue = age.value.trim();
    const phoneValue = phone.value.trim();
    const govtIdValue = govtId.value.trim();
    const addressValue = address.value.trim();
    const qualificationValue = qualification.value.trim();
    const aboutValue = about.value.trim();
    const emailValue = email.value.trim();
    const passwordValue = password.value.trim();
    const password2Value = password2.value.trim();

    if(usernameValue === '') {
        setError(username, 'Username is required');
    } else {
        setSuccess(username);
    }

    if(ageValue === '') {
        setError(age, 'Age is required');
    } else if((ageValue < 0) || (ageValue > 120)){
        setError(age, 'Provide a valid age');
    } else {
        setSuccess(age);
    }

    if(phoneValue === '') {
        setError(phone, 'Phone number is required');
    } else if (isValidPhone.length != 10) {
        setError(phone, 'Provide a valid phone number');
    } else {
        setSuccess(phone);
    }

    if(govtIdValue === '') {
        setError(govtId, 'Goverment ID is required');
    } else {
        setSuccess(govtId);
    }

    if(addressValue === '') {
        setError(address, 'Address is required');
    } else {
        setSuccess(address);
    }

    if(qualificationValue === '') {
        setError(qualification, 'Qualification is required');
    } else {
        setSuccess(qualification);
    }

    if(aboutValue === '') {
        setError(about, 'About yourself is required');
    }
    else if((aboutValue.length > 100) || (aboutValue.length < 500)){
        setError(about, "Tell us about yourself in mininmum 20 words and maximum 100 words")
    }
    else {
        setSuccess(about);
    }

    if(emailValue === '') {
        setError(email, 'Email is required');
    } else if (!isValidEmail(emailValue)) {
        setError(email, 'Provide a valid email address');
    } else {
        setSuccess(email);
    }

    if(passwordValue === '') {
        setError(password, 'Password is required');
    } else if (passwordValue.length < 8 ) {
        setError(password, 'Password must be at least 8 character.')
    } else {
        setSuccess(password);
    }

    if(password2Value === '') {
        setError(password2, 'Please confirm your password');
    } else if (password2Value !== passwordValue) {
        setError(password2, "Passwords doesn't match");
    } else {
        setSuccess(password2);
    }

};
