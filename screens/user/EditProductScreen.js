import React, {useState, useEffect, useCallback, useReducer} from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    Platform,
    Alert,
    KeyboardAvoidingView,
    ActivityIndicator,
} from 'react-native';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {useSelector, useDispatch} from 'react-redux';

import HeaderButton from '../../components/UI/HeaderButton';
import * as productsActions from '../../store/actions/products';
import Input from '../../components/UI/Input';
import Colors from '../../constants/Colors';

const FORM_INPUT_UPDATE = 'FORM_INPUT_UPDATE';

// located outside of the component so it doesn't have to re-render
const formReducer = (state, action) => {
    if (action.type === FORM_INPUT_UPDATE) {
        const updatedValues = {
            ...state.inputValues, // copy existing state input values
            [action.input]: action.value, // dynamically assigned input
        };
        const updatedValidities = {
            ...state.inputValidities,
            [action.input]: action.isValid,
        };
        let updatedFormIsValid = true;
        for (const key in updatedValidities) {
            updatedFormIsValid = updatedFormIsValid && updatedValidities[key]; // false overrides true, one form
        }
        return {
            // return a new state
            formIsValid: updatedFormIsValid,
            inputValues: updatedValues, // overwrite input values with updated values
            inputValidities: updatedValidities,
        };
    }
    return state; //returns unchanged change if doesn't pass if block
};

const EditProductScreen = (props) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState();

    const prodId = props.navigation.getParam('productId'); // this paramter will not be set if a new item
    const editedProduct = useSelector((
        state // will return a
    ) => state.products.userProducts.find((prod) => prod.id === prodId)); // will return true if product exist as a user product
    const dispatch = useDispatch();

    const [formState, dispatchFormState] = useReducer(formReducer, {
        //formState gets state
        // dispatchFormState is able to use functions against the useReducer
        inputValues: {
            title: editedProduct ? editedProduct.title : '',
            imageUrl: editedProduct ? editedProduct.imageUrl : '',
            description: editedProduct ? editedProduct.description : '',
            price: '',
        },
        inputValidities: {
            title: editedProduct ? true : false,
            imageUrl: editedProduct ? true : false,
            description: editedProduct ? true : false,
            price: editedProduct ? true : false,
        },
        formIsValid: editedProduct ? true : false,
    });

    const submitHandler = useCallback(async () => {
        // will make sure this component isn't recreated
        // and lead to an infinite loop
        console.log(formState.inputValidities.title);
        console.log(formState.inputValidities.imageUrl);
        console.log(formState.inputValidities.description);
        console.log(formState.inputValidities.price);
        if (!formState.formIsValid) {
            Alert.alert(
                'Wrong Input!',
                'Please check the errors in the form.',
                [{text: 'Okay'}]
            );
            return;
        }

        // Set loading
        setIsLoading(true);
        setError(false);

        // wrap dispatch and catch any errors
        try {
            if (editedProduct) {
                // this this exists, update product
                await dispatch(
                    productsActions.updateProduct(
                        prodId,
                        formState.inputValues.title,
                        formState.inputValues.description,
                        formState.inputValues.imageUrl
                    )
                );
            } else {
                await dispatch(
                    productsActions.createProduct(
                        formState.inputValues.title,
                        formState.inputValues.description,
                        formState.inputValues.imageUrl,
                        +formState.inputValues.price // + will convert to a string
                    )
                );
            }
            props.navigation.goBack();
        } catch (err) {
            setError(err);
        }

        // Wait for dispatch to finish, then setIsLoading to false
        setIsLoading(false);
    }, [dispatch, prodId, formState]);

    // setParams in order for the function to be reachable outside of the component
    useEffect(() => {
        // place inside effect so component wont reload if props change.
        props.navigation.setParams({submit: submitHandler});
    }, [submitHandler]);

    // input validator
    const inputChangeHandler = useCallback(
        (inputIdentifier, inputValue, inputValidity) => {
            dispatchFormState({
                type: FORM_INPUT_UPDATE,
                value: inputValue,
                isValid: inputValidity, // this will only happen if the input looses focus
                input: inputIdentifier, // this is the trigger
            });
        },
        [dispatchFormState]
    );

    // Check if loading
    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size='large' color={Colors.primary} />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={{flex: 1}} // it needs to serve the entire screen size
            behavior='padding'
            keyboardVerticalOffset={100}
        >
            <ScrollView>
                <View style={styles.form}>
                    <Input
                        id='title' // removed from bind
                        label='Title'
                        errorText='Please enter a valid title!'
                        keyboardType='default'
                        autoCapitalize='sentences'
                        autoCorrect
                        returnKeyType='next'
                        // onInputChange={inputChangeHandler.bind(this, 'title')} // bind will cause an infinite loop
                        onInputChange={inputChangeHandler}
                        initialValue={editedProduct ? editedProduct.title : ''}
                        initiallyValid={!!editedProduct}
                        required
                    />
                    <Input
                        id='imageUrl'
                        label='Image URL'
                        errorText='Please enter a valid image URL!'
                        keyboardType='default'
                        returnKeyType='next'
                        initialValue={
                            editedProduct ? editedProduct.imageUrl : ''
                        }
                        initiallyValid={!!editedProduct}
                        required
                        // onInputChange={inputChangeHandler.bind(this, 'imageUrl')}
                        onInputChange={inputChangeHandler}
                    />
                    {editedProduct ? null : (
                        <Input
                            id='price'
                            label='Price'
                            errorText='Please enter a valid Price!'
                            keyboardType='decimal-pad'
                            returnKeyType='next'
                            required
                            min={0.01}
                            // onInputChange={inputChangeHandler.bind(this, 'price')}
                            onInputChange={inputChangeHandler}
                        />
                    )}
                    <Input
                        id='description'
                        label='Description'
                        errorText='Please enter a valid description!'
                        keyboardType='default'
                        autoCapitalize='sentences'
                        autoCorrect
                        multiline
                        numberOfLines={3} // this will only work for android
                        initialValue={
                            editedProduct ? editedProduct.description : ''
                        }
                        initiallyValid={!!editedProduct}
                        required
                        minLength={5}
                        // onInputChange={inputChangeHandler.bind(this, 'description')}
                        onInputChange={inputChangeHandler}
                    />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

EditProductScreen.navigationOptions = (navData) => {
    const submitFn = navData.navigation.getParam('submit');
    return {
        headerTitle: navData.navigation.getParam('productId') // if productId was passed through
            ? 'Edit Product'
            : 'Add Product',
        headerRight: (
            <HeaderButtons HeaderButtonComponent={HeaderButton}>
                <Item
                    title='Save'
                    iconName={
                        Platform.OS === 'android'
                            ? 'md-checkmark'
                            : 'ios-checkmark'
                    }
                    onPress={submitFn}
                />
            </HeaderButtons>
        ),
    };
};

const styles = StyleSheet.create({
    form: {
        margin: 20,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default EditProductScreen;
