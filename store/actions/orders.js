import Order from '../../models/orders';

export const ADD_ORDER = 'ADD_ORDER';
export const SET_ORDERS = 'SET_ORDERS';

export const fetchOrders = () => {
    return async (dispatch, getState) => {
        const userId = getState().auth.userId;

        try {
            const response = await fetch(
                `https://the-shopping-app-rn.firebaseio.com/orders/${userId}.json`
            );

            if (!response.ok) {
                throw new Error('Something went wrong!');
            }

            // place the json response  in resData
            const resData = await response.json();
            // initialize array
            const loadedOrders = [];

            // Place all the data from the object in Loaded Orders
            for (const key in resData) {
                loadedOrders.push(
                    new Order(
                        key,
                        resData[key].cartItems,
                        resData[key].totalAmount,
                        new Date(resData[key].date)
                    )
                );
            }
            dispatch({type: SET_ORDERS, orders: loadedOrders});
        } catch (err) {
            throw err;
        }
    };
};

export const addOrder = (cartItems, totalAmount) => {
    return async (dispatch, getState) => {
        const date = new Date();
        const token = getState().auth.token;
        const userId = getState().auth.userId;
        const response = await fetch(
            `https://the-shopping-app-rn.firebaseio.com/orders/${userId}.json?auth=${token}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    cartItems,
                    totalAmount,
                    date: date.toISOString(),
                }),
            }
        );

        if (!response.ok) {
            throw new Error('Something went wrong!');
        }

        const resData = await response.json();

        dispatch({
            type: ADD_ORDER,
            orderData: {
                id: resData.name,
                items: cartItems,
                amount: totalAmount,
                date: date,
            },
        });
    };
};
