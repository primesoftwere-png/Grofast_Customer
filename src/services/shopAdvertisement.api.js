import apiClient from './api.service';

export const shopAdvertisementAPI = {
  // Get active advertisements (banners and ads)
  getActiveAds: async (params = {}) => {
    try {
      const response = await apiClient.get('/shop-advertisements/list', { params });
      return response;
    } catch (error) {
      console.error('Error fetching shop advertisements:', error);
      throw error;
    }
  }
};
