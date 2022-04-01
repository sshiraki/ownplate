import { analytics } from "~/lib/firebase/firebase9";
import { logEvent } from "firebase/analytics";
// see https://firebase.google.com/docs/analytics/measure-ecommerce

// Event List
// https://firebase.google.com/docs/reference/js/firebase.analytics.EventName
// https://developers.google.com/gtagjs/reference/ga4-events#login
// https://firebase.google.com/docs/reference/js/firebase.analytics.Analytics

export const sku_item_data = (menu, shopInfo, restaurantId) => {
  return {
    item_id: "SKU_" + menu.id,
    item_name: menu.itemName,
    item_brand: shopInfo.restaurantName,
    price: menu.price,
    promotion_id: restaurantId,
  };
};
export const sku_item_data2 = (menu, shopInfo, restaurantId, quantity) => {
  return {
    item_id: "SKU_" + menu.id,
    item_name: menu.itemName,
    item_brand: shopInfo.restaurantName,
    price: menu.price,
    promotion_id: restaurantId,
    quantity,
  };
};

const analyticsWrapper = (eventName, data) => {
  console.log(eventName, data);
  logEvent(analytics, eventName, data);
};

export const sendMenuListView = (menus, shopInfo, restaurantId) => {
  try {
    const analyticsData = {
      item_list_id: restaurantId,
      item_list_name: shopInfo.restaurantName,
      items: menus.map((item) => {
        return sku_item_data(item, shopInfo, restaurantId);
      }),
    };
    analyticsWrapper(
      'view_item_list',
      analyticsData
    );
  } catch (e) {
    console.log(e);
  }
};

export const sendBeginCheckoout = (price, menus, shopInfo, restaurantId) => {
  try {
    const analyticsData = {
      currency: "JPY",
      value: price,
      items: menus.map((item) => {
        return sku_item_data2(item, shopInfo, restaurantId, item.quantity);
      }),
    };
    analyticsWrapper(
      'begin_checkout',
      analyticsData
    );
  } catch (e) {
    console.log(e);
  }
};

export const sendPurchase = (
  orderInfo,
  orderId,
  menus,
  shopInfo,
  restaurantId
) => {
  try {
    const analyticsData = {
      transaction_id: orderId,
      affiliation: shopInfo.restaurantName,
      currency: "JPY",
      value: orderInfo.total,
      tax: orderInfo.tax,
      items: menus.map((item) => {
        return sku_item_data2(item, shopInfo, restaurantId, item.quantity);
      }),
    };
    // console.log(analyticsData);
    analyticsWrapper('purchase', analyticsData);
  } catch (e) {
    console.log(e);
  }
};

export const sendRedunded = (orderInfo, orderId, shopInfo, restaurantId) => {
  try {
    const analyticsData = {
      transaction_id: orderId,
      affiliation: shopInfo.restaurantName,
      currency: "JPY",
      value: orderInfo.total,
      // items: [],
    };
    analyticsWrapper('refund', analyticsData);
  } catch (e) {
    console.log(e);
  }
};

// LOGIN

export const sendViewItem = (item, shopInfo, restaurantId) => {
  // is open image
  try {
    const analyticsData = {
      currency: "JPY",
      value: item.price,
      items: [sku_item_data(item, shopInfo, restaurantId)],
    };
    analyticsWrapper('view_item', analyticsData);
  } catch (e) {
    console.log(e);
  }
};

export const sendSelectItem = (item, shopInfo, restaurantId) => {
  // is open toggle
  try {
    const analyticsData = {
      items: [sku_item_data(item, shopInfo, restaurantId)],
    };
    // console.log(analyticsData);
    analyticsWrapper('select_item', analyticsData);
  } catch (e) {
    console.log(e);
  }
};

export const sendAddToCart = (item, shopInfo, restaurantId, quantity) => {
  try {
    const analyticsData = {
      currency: "JPY",
      value: item.price,
      items: [sku_item_data2(item, shopInfo, restaurantId, quantity)],
    };
    // console.log(analyticsData);
    analyticsWrapper('add_to_cart', analyticsData);
  } catch (e) {
    console.log(e);
  }
};

export const sendRemoveFromCart = (item, shopInfo, restaurantId, quantity) => {
  try {
    const analyticsData = {
      currency: "JPY",
      value: item.price,
      items: [sku_item_data2(item, shopInfo, restaurantId, quantity)],
    };
    // console.log(analyticsData);
    analyticsWrapper(
      'remove_from_cart',
      analyticsData
    );
  } catch (e) {
    console.log(e);
  }
};

export const sendViewCart = (
  orderInfo,
  orderId,
  menus,
  shopInfo,
  restaurantId
) => {
  try {
    const analyticsData = {
      currency: "JPY",
      value: orderInfo.total,
      items: menus.map((item) => {
        return sku_item_data2(item, shopInfo, restaurantId, item.quantity);
      }),
    };
    // console.log(analyticsData);
    analyticsWrapper('view_cart', analyticsData);
  } catch (e) {
    console.log(e);
  }
};

/*
VIEW_CART
ADD_PAYMENT_INFO // input card
*/