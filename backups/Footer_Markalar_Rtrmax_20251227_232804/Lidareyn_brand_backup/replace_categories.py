
            // Mount ChromaGrid
            const categoriesNode = document.getElementById('kategoriler');
            if (categoriesNode) {
                const rootCategories = ReactDOM.createRoot(categoriesNode);
                // Get categories from categories-data.js (matching mega menu)
                const directCategories = [
                    {
                        title: 'Elektrikli El Aletleri',
                        description: 'Profesyonel kullanım için yüksek performanslı elektrikli el aletleri.',
                        slug: 'elektrikli-el-aletleri',
                        image: 'gorseller/category_elektrikli_el_aletleri.png'
                    },
                    {
                        title: 'Ölçme & Kontrol Aletleri',
                        description: 'Hassas ölçüm ve kontrol işlemleri için profesyonel cihazlar.',
                        slug: 'olcme-ve-kontrol-aletleri',
                        image: 'gorseller/category_olcme_kontrol.png'
                    },
                    {
                        title: 'Hırdavat ve El Aletleri',
                        description: 'Her türlü tamirat işi için el aletleri.',
                        slug: 'hirdavat-el-aletleri',
                        image: 'gorseller/category_hirdavat.png'
                    },
                    {
                        title: 'Oto Bakım ve Tamir Malzemeleri',
                        description: 'Otomobil bakımı ve onarımı için gerekli profesyonel ekipmanlar.',
                        slug: 'oto-bakim-tamir',
                        image: 'gorseller/category_oto_bakim.png'
                    },
                    {
                        title: 'Yapı ve İnşaat Malzemeleri',
                        description: 'İnşaat, tadilat ve tamirat işleriniz için profesyonel yapı kimyasalları ve malzemeleri.',
                        slug: 'nalbur-yapi-malzemeleri',
                        image: 'gorseller/category_yapi_insaat.png'
                    },
                    {
                        title: 'Aşındırıcı ve Kesici Uçlar',
                        description: 'Her türlü yüzey işlemi için profesyonel kesme, taşlama ve zımparalama ürünleri.',
                        slug: 'asindirici-kesici',
                        image: 'gorseller/category_asindirici_kesici.png'
                    },
                    {
                        title: 'Yapıştırıcı, Dolgu ve Kimyasallar',
                        description: 'İnşaat ve tamirat işleriniz için profesyonel yapı kimyasalları.',
                        slug: 'yapi-kimyasallari',
                        image: 'gorseller/category_yapi_kimyasallari.png'
                    },
                    {
                        title: 'Kaynak Malzemeleri',
                        description: 'Profesyonel kaynak makineleri, elektrotlar ve koruyucu ekipmanlar.',
                        slug: 'kaynak-malzemeleri',
                        image: 'gorseller/category_kaynak.png'
                    },
                    {
                        title: 'Tesisat Malzemeleri',
                        description: 'Su, ısıtma ve havalandırma çözümleri.',
                        slug: 'tesisat-malzemeleri',
                        image: 'gorseller/category_tesisat.png'
                    },
                    {
                        title: 'İş Güvenliği ve Çalışma Ekipmanları',
                        description: 'Güvenli çalışma ortamları için gerekli koruyucu donanımlar.',
                        slug: 'is-guvenligi-ve-calisma-ekipmanlari',
                        image: 'gorseller/category_is_guvenligi.png'
                    },
                    {
                        title: 'Elektronik Aksesuar',
                        description: 'Elektronik ve telefon aksesuarları.',
                        slug: 'elektronik-aksesuar',
                        image: 'gorseller/category_elektronik.png'
                    },
                ];

                // Take only first 18 categories for 3x6 grid
                const items = directCategories.slice(0, 18).map(category => {
                    return {
                        title: category.title,
                        subtitle: category.description,
                        url: `kategoriler/${category.slug}.html`,
                        image: category.image
                    };
                });

                // Add section title
                const titleElement = document.createElement('h2');
                titleElement.className = 'section-title page-main-title';
                titleElement.textContent = 'Tüm Kategoriler';
                categoriesNode.appendChild(titleElement);

                // Create grid container
                const gridContainer = document.createElement('div');
                gridContainer.id = 'categories-grid-root';
                categoriesNode.appendChild(gridContainer);

                const rootCategoriesGrid = ReactDOM.createRoot(gridContainer);
                rootCategoriesGrid.render(<ChromaGrid items={items} />);
            }
