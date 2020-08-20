// component used while app is loading and checking user

import React, {useEffect} from 'react';
import {
    StyleSheet,
    Text,
    View,
    ActivityIndicator,
    AsyncStorage,
} from 'react-native';
import Colors from '../constants/Colors';

import {useDispatch} from 'react-redux';
import * as authActions from '../store/actions/auth';

const StartupScreen = (props) => {
    const dispatch = useDispatch();

    // when component mounts:
    useEffect(() => {
        const tryLogin = async () => {
            // retrieve data from storage
            const userData = await AsyncStorage.getItem('userData');
            if (!userData) {
                // If there is no user data, to go auth screen
                props.navigation.navigate('Auth');
            } else {
                props.navigation.navigate('Shop');
            }

            // convert to JSON format
            const transformedData = JSON.parse(userData);
            // extract transformed data
            const {token, userId, expiryDate} = transformedData;
            // retrieve the current date
            const expirationDate = new Date(expiryDate);

            // check if token is invalid, if there is no token, or if no user ID
            if (expirationDate <= new Date() || token === null || !useId) {
                props.navigation.navigate('Auth');
                return;
            }

            const expirationTime =
                // gets time in milliseconds - current time in milliseconds
                expirationDate.getTime() - new Date().getTime();

            props.navigation.navigate('Shop');
            // if userId, and token exists, store in Redux using authActions.authenticate, then try logging in again
            dispatch(authActions.authenticate(userId, token, expirationTime));
        };
        tryLogin();
        // dispatch as a dependency but since it never changes, the component will not rerun
    }, [dispatch]);

    return (
        <View style={styles.screen}>
            <ActivityIndicator size='large' color={Colors.primary} />
        </View>
    );
};

export default StartupScreen;

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
