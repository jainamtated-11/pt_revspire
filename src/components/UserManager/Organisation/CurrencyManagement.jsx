import { useState, useEffect } from "react";
import { X, Check, Plus, Trash2, ChevronDown } from "lucide-react";
import { LuLoaderCircle } from "react-icons/lu";
import toast from "react-hot-toast";
import useAxiosInstance from "../../../Services/useAxiosInstance";

const CurrencyManagementModal = ({
  isOpen,
  onClose,
  organisationId,
  viewerId,
  currentCorporateCurrency,
  currencies,
  onSaveSuccess
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currencyRates, setCurrencyRates] = useState([]);
  const [newCorporateCurrency, setNewCorporateCurrency] = useState(currentCorporateCurrency);
  const [missingConversions, setMissingConversions] = useState([]);
  const [newCurrencyToAdd, setNewCurrencyToAdd] = useState("");
  const [isAddingCurrency, setIsAddingCurrency] = useState(false);
  const axiosInstance = useAxiosInstance();

  useEffect(() => {
    if (isOpen && organisationId) {
      loadCurrencyData();
    }
  }, [isOpen, organisationId]);

  const loadCurrencyData = async () => {
    try {
      setIsLoading(true);
      
      // Reset states
      setNewCorporateCurrency(currentCorporateCurrency);
      setCurrencyRates([]);
      setMissingConversions([]);
      
      // Load current rates
      const ratesResponse = await axiosInstance.post('/view-organisation-currency-rates', {
        organisation_id: organisationId
      });
      
      if (ratesResponse.data.success) {
        setCurrencyRates(ratesResponse.data.data);
      }
      
      // Check for missing conversions
      const missingResponse = await axiosInstance.post('/missing-currency-conversions', {
        organisation_id: organisationId
      });
      
      if (missingResponse.data.success) {
        setMissingConversions(missingResponse.data.missing_conversions || []);
      }
    } catch (error) {
      console.error('Error loading currency data:', error);
      toast.error('Failed to load currency data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCorporateCurrencyChange = (e) => {
    const newCurrencyId = e.target.value;
    const previousCorporateCurrency = newCorporateCurrency;
    setNewCorporateCurrency(newCurrencyId);
    
    // Find the new and previous corporate currency ISO codes
    const newCorporateCurrencyObj = currencies.find(c => c.id === newCurrencyId);
    const previousCorporateCurrencyObj = currencies.find(c => c.id === previousCorporateCurrency);
    
    if (!newCorporateCurrencyObj || !previousCorporateCurrencyObj) return;
    
    // Find the rate for the previous corporate currency
    const previousCorporateRate = currencyRates.find(rate => 
      rate.currency_iso === previousCorporateCurrencyObj.iso_code
    );
    
    // Find the rate for the new corporate currency
    const newCorporateRate = currencyRates.find(rate => 
      rate.currency_iso === newCorporateCurrencyObj.iso_code
    );
    
    // If we have rates for both currencies, convert all rates
    if (previousCorporateRate && newCorporateRate) {
      const conversionFactor = previousCorporateRate.original_rate / newCorporateRate.original_rate;
      
      setCurrencyRates(prevRates => 
        prevRates.map(rate => {
          // The new corporate currency should have rate 1
          if (rate.currency_iso === newCorporateCurrencyObj.iso_code) {
            return {
              ...rate,
              relative_rate: 1,
              original_rate: 1
            };
          }
          
          // Convert other rates
          return {
            ...rate,
            relative_rate: parseFloat((rate.original_rate * conversionFactor).toFixed(4))
          };
        })
      );
    } else if (newCorporateRate) {
      // If only the new corporate currency has a rate, use it as the base
      const conversionFactor = 1 / newCorporateRate.original_rate;
      
      setCurrencyRates(prevRates => 
        prevRates.map(rate => ({
          ...rate,
          relative_rate: rate.currency_iso === newCorporateCurrencyObj.iso_code 
            ? 1 
            : parseFloat((rate.original_rate * conversionFactor).toFixed(4))
        }))
      );
    } else {
      // If no rate exists for the new corporate currency, clear all rates
      setCurrencyRates(prevRates => 
        prevRates.map(rate => ({
          ...rate,
          relative_rate: null
        }))
      );
    }
  };

    const handleRateChange = (currencyIso, newRate) => {
        // Allow numbers and dots, remove any other characters
        const sanitizedValue = newRate.replace(/[^0-9.]/g, '');
        
        // Ensure there's only one decimal point
        const parts = sanitizedValue.split('.');
        let formattedValue = sanitizedValue;
        
        if (parts.length > 1) {
            formattedValue = parts[0] + '.' + parts[1].slice(0, 4); // Limit to 4 decimal places
        }
        
        // Don't allow values that start with a dot
        if (formattedValue.startsWith('.')) {
            formattedValue = '0' + formattedValue;
        }
        
        // Convert to number only when we need to save it
        setCurrencyRates(prevRates => 
            prevRates.map(rate => 
            rate.currency_iso === currencyIso 
                ? { 
                    ...rate, 
                    relative_rate: formattedValue === '' ? null : formattedValue,
                    original_rate: formattedValue === '' ? null : parseFloat(formattedValue)
                }
                : rate
            )
        );
    };

  const addNewCurrency = async (currencyIso) => {
    if (!currencyIso) return;
    
    if (!currencyRates.some(rate => rate.currency_iso === currencyIso)) {
      const currency = currencies.find(c => c.iso_code === currencyIso);
      if (currency) {
        setIsAddingCurrency(true);
        try {
          // In a real app, you might fetch current exchange rates from an API here
          setCurrencyRates(prev => [
            ...prev,
            {
              currency_iso: currencyIso,
              relative_rate: null,
              original_rate: null
            }
          ]);
        } finally {
          setIsAddingCurrency(false);
        }
      }
    }
    setNewCurrencyToAdd("");
  };

  const removeCurrency = (currencyIso) => {
    setCurrencyRates(prevRates => 
      prevRates.filter(rate => rate.currency_iso !== currencyIso)
    );
  };

  const saveChanges = async () => {
    try {
      setIsLoading(true);
      
      // First update corporate currency if changed
      if (newCorporateCurrency !== currentCorporateCurrency) {
        await axiosInstance.post('/update-company-info', {
          viewer_id: viewerId,
          organisation_id: organisationId,
          currency: newCorporateCurrency
        });
      }
      
      // Prepare currency rates for update
      const newCorporateCurrencyIso = currencies.find(c => c.id === newCorporateCurrency)?.iso_code;
      const ratesToUpdate = currencyRates
        .filter(rate => rate.relative_rate !== null && !isNaN(rate.relative_rate))
        .map(rate => ({
          currency_id: currencies.find(c => c.iso_code === rate.currency_iso)?.id,
          rate: rate.currency_iso === newCorporateCurrencyIso ? 1 : rate.relative_rate
        }));
      
      // Update currency rates
      await axiosInstance.post('/update-organisation-currencies', {
        organisation_id: organisationId,
        currency_rates: ratesToUpdate
      });
      
      toast.success('Currency settings updated successfully');
      onClose();
      if (onSaveSuccess) onSaveSuccess();
    } catch (error) {
      console.error('Error saving currency changes:', error);
      toast.error('Failed to update currency settings');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Currency Management</h2>
            <p className="text-sm text-gray-500 mt-1">
              Set your base currency and conversion rates
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - Scrollable area */}
        <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 150px)' }}>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <LuLoaderCircle className="animate-spin text-blue-500 text-2xl" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Corporate Currency Selection */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base Currency
                </label>
                <div className="relative">
                  <select
                    value={newCorporateCurrency}
                    onChange={handleCorporateCurrencyChange}
                    className="w-full appearance-none border border-gray-300 rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  >
                    {currencies.map((currency) => (
                      <option key={currency.id} value={currency.id}>
                        {currency.iso_code} - {currency.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
                    <ChevronDown className="h-5 w-5" />
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  All financial reports will be converted to this currency
                </p>
              </div>

              {/* Currency Rates */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-700">
                    Conversion Rates
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <select
                        value={newCurrencyToAdd}
                        onChange={(e) => setNewCurrencyToAdd(e.target.value)}
                        className="appearance-none text-sm border border-gray-300 rounded-lg px-3 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      >
                        <option value="">Add currency</option>
                        {currencies
                          .filter(c => !currencyRates.some(r => r.currency_iso === c.iso_code))
                          .map(currency => (
                            <option key={currency.id} value={currency.iso_code}>
                              {currency.iso_code}
                            </option>
                          ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-gray-500">
                        <ChevronDown className="h-4 w-4" />
                      </div>
                    </div>
                    <button
                      onClick={() => addNewCurrency(newCurrencyToAdd)}
                      disabled={!newCurrencyToAdd || isAddingCurrency}
                      className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed text-blue-600 transition-colors"
                    >
                      {isAddingCurrency ? (
                        <LuLoaderCircle className="animate-spin w-4 h-4" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {currencyRates.length === 0 ? (
                    <div className="text-center py-6 text-gray-400 bg-gray-50 rounded-lg">
                      No currency rates configured yet
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
                      {currencyRates.map((rate) => {
                        const isCorporate = rate.currency_iso === 
                          currencies.find(c => c.id === newCorporateCurrency)?.iso_code;
                        
                        return (
                          <div 
                            key={rate.currency_iso} 
                            className="flex items-center gap-4 p-4 bg-white hover:bg-gray-50 transition-colors"
                          >
                            <div className="w-24 font-medium text-gray-700">
                              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-600 font-semibold">
                                {rate.currency_iso}
                              </span>
                            </div>
                            <div className="flex-1 flex items-center gap-2">
                              <span className="text-gray-500">=</span>
                              <input
                                type="text"
                                inputMode="decimal"
                                value={rate.relative_rate ?? ''}
                                onChange={(e) => handleRateChange(rate.currency_iso, e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="0.0000"
                                disabled={isCorporate}
                              />
                              <span className="text-gray-500">
                                {currencies.find(c => c.id === newCorporateCurrency)?.iso_code}
                              </span>
                            </div>
                            {!isCorporate && (
                              <button
                                onClick={() => removeCurrency(rate.currency_iso)}
                                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-red-500 transition-colors"
                                title="Remove currency"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            )}
                            {isCorporate && (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                Base
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Missing Conversions */}
              {missingConversions.length > 0 && (
                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3 flex-1">
                      <h4 className="text-sm font-medium text-amber-800">Missing Conversion Rates</h4>
                      <div className="mt-2 text-sm text-amber-700">
                        <p>
                          These currencies are used in your pitches but don't have conversion rates:
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {missingConversions.map(iso => (
                            <button
                              key={iso}
                              onClick={() => addNewCurrency(iso)}
                              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded-lg shadow-sm text-amber-800 bg-amber-100 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                            >
                              <Plus className="-ml-0.5 mr-1 h-3 w-3" />
                              {iso}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t p-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={saveChanges}
            disabled={isLoading}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <LuLoaderCircle className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const CurrencyManagement = ({ 
  organisationId, 
  viewerId,
  currentCorporateCurrency,
  currencies,
  onSaveSuccess
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-gray-200 hover:bg-gray-300 border border-gray-800 w-[100px] h-[30px] rounded-md"
      >
        Manage
      </button>
      
      <CurrencyManagementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        organisationId={organisationId}
        viewerId={viewerId}
        currentCorporateCurrency={currentCorporateCurrency}
        currencies={currencies}
        onSaveSuccess={onSaveSuccess}
      />
    </>
  );
};

export default CurrencyManagement;