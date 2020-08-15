import {ADD_ORDER} from '../actions/orders';
import Order from '../../models/orders';
const initialState = {
    orders: [],
};

export default (state = initialState, action) => {
    switch (action.type) {
        case ADD_ORDER:
            const newOrder = new Order(
                new Date().toString(), // dummy id
                action.orderData.items,
                action.orderData.amount,
                new Date()
            );
            return {
                ...state,
                orders: state.orders.concat(newOrder),
                // add the new order to the array of orders without touching the old state
            };
    }
    return state;
};
