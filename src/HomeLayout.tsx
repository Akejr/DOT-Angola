  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full bg-white rounded-3xl shadow-xl overflow-hidden">
        <Header />
        <Navigation onPageChange={handlePageChange} />
        
        <div id="gift-card-content">
          <HeroBanner />
          
          {/* Seção de Cards Mais Vendidos - Versão mais compacta */}
          <div className="relative py-6 px-6 overflow-hidden bg-gray-100">
            {/* ... existing code ... */}
          </div>
          
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-1/4 border-r">
              <FilterSection 
                onCategorySelect={handleCategorySelect}
                selectedCategory={selectedCategory}
              />
            </div>
            <div className="w-full md:w-3/4 p-6">
              <GiftCardGrid 
                selectedCategory={selectedCategory}
              />
            </div>
          </div>
        </div>
        
        <footer className="bg-gray-50 p-6 border-t">
          {/* ... existing code ... */}
        </footer>
      </div>
    </div>
  ); 