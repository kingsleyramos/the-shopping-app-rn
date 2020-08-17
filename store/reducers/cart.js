import {ADD_TO_CART, REMOVE_FROM_CART} from '../actions/cart';
import CartItem from '../../models/cart-item';
import {ADD_ORDER} from '../actions/orders';
import {DELETE_PRODUCT} from '../actions/products';

const initialState = {
    items: {},
    totalAmount: 0,
};

export default (state = initialState, action) => {
    switch (action.type) {
        case ADD_TO_CART:
            const addedProduct = action.product;
            const prodPrice = addedProduct.price;
            const prodTitle = addedProduct.title;

            let updatedOrNewCartItem;

            if (state.items[addedProduct.id]) {
                // already have the item in the cart
                updatedOrNewCartItem = new CartItem(
                    state.items[addedProduct.id].quantity + 1,
                    prodPrice,
                    prodTitle,
                    state.items[addedProduct.id].sum + prodPrice
                );
            } else {
                // If the item does not exist yet
                // create new card item
                updatedOrNewCartItem = new CartItem(
                    1,
                    prodPrice,
                    prodTitle,
                    prodPrice
                );
            }
            // return the current state, and add item
            return {
                ...state,
                items: {
                    ...state.items,
                    [addedProduct.id]: updatedOrNewCartItem,
                },
                totalAmount: state.totalAmount + prodPrice, // add price
            };
        case REMOVE_FROM_CART:
            const selectedCartItem = state.items[action.pid];
            const currentQty = selectedCartItem.quantity;
            let updatedCart;

            if (currentQty > 1) {
                const updatedCartItem = new CartItem(
                    selectedCartItem.quantity - 1,
                    selectedCartItem.productPrice,
                    selectedCartItem.productTitle,
                    selectedCartItem.sum - selectedCartItem.productPrice
                );
                updatedCart = {
                    ...state.items,
                    [action.pid]: updatedCartItem,
                };
            } else {
                updatedCart = {...state.items};
                delete updatedCart[action.pid];
            }
            return {
                ...state,
                items: updatedCart,
                totalAmount: Math.abs(
                    state.totalAmount - selectedCartItem.productPrice
                ),
            };
        case ADD_ORDER:
            return initialState;
        case DELETE_PRODUCT:
            if (!state.items[action.pid]) {
                // check if item is in the cart
                return state; // if not in the cart, it will return the existing state
            }

            const updatedItems = {...state.items}; // copy all items in state
            const itemTotal = state.items[action.pid].sum; // get the item total
            delete updatedItems[action.pid]; // delete that item from the state (the cart)
            return {
                ...state,
                items: updatedItems,
                totalAmount: state.totalAmount - itemTotal,
            };
    }
    return state;
};
