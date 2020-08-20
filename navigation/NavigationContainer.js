import React, {useEffect, useRef} from 'react';
import {useSelector} from 'react-redux';
import {NavigationActions} from 'react-navigation';

import ShopNavigator from './ShopNavigator';

const NavigationContainer = () => {
    // use useRef hook to get navigation props form shopNavigator
    // since navigation props are only for those inside the navigator
    const navRef = useRef();
    const isAuth = useSelector((state) => !!state.auth.token);

    useEffect(() => {
        if (!isAuth) {
            //navRef is referencing dispatch method from shopNavigator container
            navRef.current.dispatch(
                //use NavigationAction to navigate to Auth even if it's outside the navigator
                NavigationActions.navigate({routeName: 'Auth'})
            );
        }
    }, [isAuth]);

    return <ShopNavigator ref={navRef} />;
};

export default NavigationContainer;
