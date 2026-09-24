import API from './api';

export const generateInvoice = async (rentalId, options = {}) => {
  try {
    const res = await API.post('/invoices/generate', { rentalId, ...options });
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: err.message };
  }
};

export const getUserInvoices = async () => {
  try {
    const res = await API.get('/invoices');
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: err.message };
  }
};

export const getInvoiceById = async (invoiceId) => {
  try {
    const res = await API.get(`/invoices/${invoiceId}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: err.message };
  }
};

export const getInvoiceByRental = async (rentalId) => {
  try {
    const res = await API.get(`/invoices/rental/${rentalId}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: err.message };
  }
};

export const payInvoice = async (invoiceId, paymentData = {}) => {
  try {
    const res = await API.post(`/invoices/${invoiceId}/pay`, paymentData);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: err.message };
  }
};
