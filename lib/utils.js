// lib/utils.js
export const generateReferenceNumber = (prefix = 'TRV') => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substr(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${randomStr}`;
};

export const calculateTotal = (adults, children, infants, adultPrice, childPrice, infantPrice) => {
  const adultsCount = parseInt(adults) || 0;
  const childrenCount = parseInt(children) || 0;
  const infantsCount = parseInt(infants) || 0;
  const adultPriceVal = parseFloat(adultPrice) || 0;
  const childPriceVal = parseFloat(childPrice) || 0;
  const infantPriceVal = parseFloat(infantPrice) || 0;

  return (adultsCount * adultPriceVal) + 
         (childrenCount * childPriceVal) + 
         (infantsCount * infantPriceVal);
};