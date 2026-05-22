$products = @(
  @{id=5; cat='rice'; name='আকিজ এসেনশিয়াল মিনিকেট চাল ২৫ কেজি'; en='Akij Miniket Rice 25kg'; w='25 kg'; p=1800; img='./images/rice_akij.png'},
  @{id=6; cat='rice'; name='আকিজ এসেন্সিয়াল মিনিকেট চাল ৫০ কেজি'; en='Akij Miniket Rice 50kg'; w='50 kg'; p=3985; img='./images/rice_akij_50.png'},
  @{id=7; cat='rice'; name='আমিন আটাশ চাল ২৫ কেজি'; en='Amin Athash Rice 25kg'; w='25 kg'; p=1020; img='./images/rice_amin_25.png'},
  @{id=8; cat='rice'; name='আমিন আটাশ চাল ৫০ কেজি'; en='Amin Athash Rice 50kg'; w='50 kg'; p=2600; img='./images/rice_amin.png'},
  @{id=9; cat='rice'; name='ঈশান মিনিকেট চাল ৫০ কেজি'; en='Eshan Miniket Rice 50kg'; w='50 kg'; p=3890; img='./images/rice_amin.png'},
  @{id=11; cat='rice'; name='নজরুল মিনিকেট চাল ২৫ কেজি'; en='Nazrul Miniket Rice 25kg'; w='25 kg'; p=1500; img='./images/rice_nazrul.png'},
  @{id=12; cat='rice'; name='নজরুল মিনিকেট চাল ৫০ কেজি'; en='Nazrul Miniket Rice 50kg'; w='50 kg'; p=800; img='./images/rice_nazrul_50.png'},
  @{id=10; cat='sugar'; name='চিনি (ফ্রেশ/তীর/ইগলু) ৫০ কেজি'; en='Sugar 50kg'; w='50 kg'; p=5050; img='./images/sugar_bag.png'},
  @{id=100; cat='sugar'; name='ফ্রেশ চিনি ৫০ কেজি'; en='Fresh Sugar 50kg'; w='50 kg'; p=5050; img='./images/sugar_bag.png'},
  @{id=101; cat='sugar'; name='তীর চিনি ৫০ কেজি'; en='Teer Sugar 50kg'; w='50 kg'; p=5060; img='./images/sugar_bag.png'},
  @{id=102; cat='sugar'; name='ইগলু চিনি ৫০ কেজি'; en='Igloo Sugar 50kg'; w='50 kg'; p=5040; img='./images/sugar_bag.png'},
  @{id=103; cat='sugar'; name='দেশি চিনি ৫০ কেজি'; en='Local Sugar 50kg'; w='50 kg'; p=4900; img='./images/sugar_bag.png'},
  @{id=200; cat='dal'; name='দেশি মসুর ডাল ২৫ কেজি'; en='Local Masoor Dal 25kg'; w='25 kg'; p=2500; img='./images/dal.png'},
  @{id=201; cat='dal'; name='নেপালি মসুর ডাল ২৫ কেজি'; en='Nepali Masoor Dal 25kg'; w='25 kg'; p=2800; img='./images/dal.png'},
  @{id=202; cat='dal'; name='মুগ ডাল ২৫ কেজি'; en='Moong Dal 25kg'; w='25 kg'; p=3000; img='./images/dal.png'},
  @{id=203; cat='dal'; name='খেসারি ডাল ২৫ কেজি'; en='Khesari Dal 25kg'; w='25 kg'; p=1500; img='./images/dal.png'},
  @{id=300; cat='oil'; name='রূপচাঁদা সয়াবিন তেল ৫ লিটার'; en='Rupchanda Soybean Oil 5L'; w='5 Liter'; p=800; img='./images/oil.png'},
  @{id=301; cat='oil'; name='তীর সয়াবিন তেল ৫ লিটার'; en='Teer Soybean Oil 5L'; w='5 Liter'; p=790; img='./images/oil.png'},
  @{id=302; cat='oil'; name='ফ্রেশ সয়াবিন তেল ৫ লিটার'; en='Fresh Soybean Oil 5L'; w='5 Liter'; p=790; img='./images/oil.png'},
  @{id=303; cat='oil'; name='পুষ্টি সয়াবিন তেল ৫ লিটার'; en='Pusti Soybean Oil 5L'; w='5 Liter'; p=780; img='./images/oil.png'},
  @{id=400; cat='flour'; name='তীর আটা ৫০ কেজি'; en='Teer Ata 50kg'; w='50 kg'; p=1800; img='./images/flour.png'},
  @{id=401; cat='flour'; name='ফ্রেশ আটা ৫০ কেজি'; en='Fresh Ata 50kg'; w='50 kg'; p=1790; img='./images/flour.png'},
  @{id=402; cat='flour'; name='তীর ময়দা ৫০ কেজি'; en='Teer Maida 50kg'; w='50 kg'; p=2200; img='./images/flour.png'},
  @{id=403; cat='flour'; name='এসিআই পিওর আটা ৫০ কেজি'; en='ACI Pure Ata 50kg'; w='50 kg'; p=1850; img='./images/flour.png'},
  @{id=500; cat='grocery'; name='রাঁধুনী হলুদের গুঁড়া ৫০০ গ্রাম'; en='Radhuni Turmeric Powder 500g'; w='500 g'; p=180; img='./images/grocery.png'},
  @{id=501; cat='grocery'; name='রাঁধুনী মরিচের গুঁড়া ৫০০ গ্রাম'; en='Radhuni Chilli Powder 500g'; w='500 g'; p=220; img='./images/grocery.png'},
  @{id=502; cat='grocery'; name='প্রাণ হলুদের গুঁড়া ৫০০ গ্রাম'; en='Pran Turmeric Powder 500g'; w='500 g'; p=175; img='./images/grocery.png'},
  @{id=503; cat='grocery'; name='প্রাণ জিরার গুঁড়া ৫০০ গ্রাম'; en='Pran Cumin Powder 500g'; w='500 g'; p=350; img='./images/grocery.png'},
  @{id=600; cat='ajinomoto'; name='আজিনোমতো ১ কেজি'; en='Ajinomoto 1kg'; w='1 kg'; p=250; img='./images/ajinomoto.png'},
  @{id=601; cat='ajinomoto'; name='থাই আজিনোমতো ১ কেজি'; en='Thai Ajinomoto 1kg'; w='1 kg'; p=280; img='./images/ajinomoto.png'},
  @{id=602; cat='ajinomoto'; name='চাইনিজ আজিনোমতো ১ কেজি'; en='Chinese Ajinomoto 1kg'; w='1 kg'; p=200; img='./images/ajinomoto.png'},
  @{id=603; cat='ajinomoto'; name='মেলা আজিনোমতো ১ কেজি'; en='Mela Ajinomoto 1kg'; w='1 kg'; p=220; img='./images/ajinomoto.png'}
)

$html = ""
foreach ($p in $products) {
    $priceStr = "{0:N0}" -f $p.p
    $html += "          <div class="product-card" data-navigate="product-detail" data-category="$($p.cat)">
"
    $html += "            <div class="product-image" style="background:#f5f5f5;overflow:hidden;">
"
    $html += "              <img src="$($p.img)" style="width:100%;height:100%;object-fit:cover;" alt="Product">
"
    $html += "              <button class="add-btn" onclick="event.stopPropagation();App.addToCart({id:$($p.id),name:'$($p.name)',nameEn:'$($p.en)',weight:'$($p.w)',price:$($p.p),image:'$($p.img)'})"><i data-lucide="plus" style="width:16px;height:16px"></i></button>
"
    $html += "            </div>
"
    $html += "            <div class="product-info">
"
    $html += "              <span class="product-weight">$($p.w)</span>
"
    $html += "              <h3 class="product-name">$($p.name)</h3>
"
    $html += "              <span class="product-price">$priceStr</span>
"
    $html += "            </div>
"
    $html += "          </div>
"
}

$file = "c:\Users\InnoSpace Infotech\Downloads\Priyoshop\index.html"
$content = Get-Content $file -Raw -Encoding UTF8
$pattern = "(?s)(<section id="screen-all-products".*?<h1 class="header-title">)সকল পণ্য(</h1>.*?<div class="product-grid"[^>]*>).*?(</section>)"
$replacement = "$1সকল পণ্য$2
" + $html + "        </div>
      $3"
$newContent = [regex]::Replace($content, $pattern, $replacement)
Set-Content -Path $file -Value $newContent -Encoding UTF8
