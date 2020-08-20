import {AsyncStorage} from 'react-native';

// export const SIGNUP = 'SIGNUP';
// export const LOGIN = 'LOGIN';
export const AUTHENTICATE = 'AUTHENTICATE';
export const LOGOUT = 'LOGOUT';

let timer;

export const authenticate = (userId, token, expiryTime) => {
    return (dispatch) => {
        // Will start the timer for logout
        dispatch(setLogoutTimer(expiryTime));
        // Save update and save token information in redux
        dispatch({type: AUTHENTICATE, userId: userId, token: token});
    };
};

export const signup = (email, password) => {
    console.log('SIGN UP');
    return async (dispatch) => {
        const response = await fetch(
            'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyBbjHaX3VU63903Ccy0SOgL2UQq2pOiuto',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                    returnSecureToken: true,
                }),
            }
        );

        if (!response.ok) {
            const errorResData = await response.json();
            console.log(errorResData);
            const errorId = errorResData.error.message;
            let message = 'Something went wrong!';
            if (errorId === 'EMAIL_EXISTS') {
                message = 'This email exists already!';
            }
            throw new Error(message);
        }

        const resData = await response.json(); // will convert from JSON to javascript
        console.log(resData);
        dispatch(
            authenticate(
                resData.localId,
                resData.idToken,
                parseInt(resData.expiresIn) * 1000
                // convert to int and converts to milliseconds
            )
        ); // save in state
        // create expiration of token
        const expirationDate = new Date( // convert the ms to a date
            // get current time in ms, convert expiresIn to ms, multiply it by 1000 out of ms
            new Date().getTime() + parseInt(resData.expiresIn) * 1000
        );
        saveDataToStorage(resData.idToken, resData.localId, expirationDate);
        // {
        // type: SIGNUP,
        // token: resData.idToken,
        // userId: resData.localId,
        // }
    };
};

export const login = (email, password) => {
    console.log('SIGN UP');
    return async (dispatch) => {
        const response = await fetch(
            'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyBbjHaX3VU63903Ccy0SOgL2UQq2pOiuto',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                    returnSecureToken: true,
                }),
            }
        );

        if (!response.ok) {
            const errorResData = await response.json();
            console.log(errorResData);
            const errorId = errorResData.error.message;
            let message = 'Something went wrong!';
            if (errorId === 'EMAIL_NOT_FOUND') {
                message = 'This email could not be found!';
            } else if (errorId === 'INVALID_PASSWORD') {
                message = 'This password is not valid!';
            }
            throw new Error(message);
        }
        const resData = await response.json(); // will convert from JSON to javascript
        console.log(resData);
        dispatch(
            authenticate(
                resData.localId,
                resData.idToken,
                parseInt(resData.expiresIn) * 1000
            )
        );
        const expirationDate = new Date(
            new Date().getTime() + parseInt(resData.expiresIn) * 1000
        );
        saveDataToStorage(resData.idToken, resData.localId, expirationDate);
        //     {
        //     type: LOGIN,
        //     token: resData.idToken,
        //     userId: resData.localId,
        // }
    };
};

export const logout = () => {
    clearLogoutTimer();
    AsyncStorage.removeItem('userData');
    return {type: LOGOUT};
};

const clearLogoutTimer = () => {
    if (timer) {
        clearTimeout(timer);
    }
};

const setLogoutTimer = (expirationTime) => {
    return (dispatch) => {
        // create another function taking advantage of redux-thunk
        timer = setTimeout(() => {
            dispatch(logout());
        }, expirationTime);
    };
};

const saveDataToStorage = (token, userId, expirationDate) => {
    AsyncStorage.setItem(
        'userData',
        JSON.stringify({
            token: token,
            userId: userId,
            expiryDate: expirationDate.toISOString(),
            // toISOString converts to a standardized format
        })
    );
};
