import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [customer, setCustomer] = useState({ name: '', phone: '' });

    const addToCart = (product) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.id === product.id);
            if (existing) {
                // Prevent adding more than stock
                if (existing.quantity + 1 > product.stock_quantity) {
                    alert(`Max stock reached for ${product.part_number}`);
                    return prev;
                }
                return prev.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const updateQuantity = (productId, quantity, maxStock) => {
        if (quantity < 1) return;
        if (quantity > maxStock) {
            alert(`Cannot exceed available stock: ${maxStock}`);
            return;
        }
        setCart((prev) =>
            prev.map((item) => (item.id === productId ? { ...item, quantity } : item))
        );
    };

    const removeFromCart = (productId) => {
        setCart((prev) => prev.filter((item) => item.id !== productId));
    };

    const clearCart = () => {
        setCart([]);
        setCustomer({ name: '', phone: '' });
    };

    const totalAmount = cart.reduce((sum, item) => sum + item.selling_price * item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                cart,
                customer,
                setCustomer,
                addToCart,
                updateQuantity,
                removeFromCart,
                clearCart,
                totalAmount,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};
