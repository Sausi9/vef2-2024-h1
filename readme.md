# Vefforritun 2, 2024, Hópverkefni 1

## Meðlimir

Auðun Bergsson aub18@hi.is, Dagur Hall dah51@hi.is, Egill Hrafn Ólafsson eho10@hi.is

## Verkefnið

Við ákvaðum að útbúa vefþjónustu fyrir viðburðarkerfi sem leyfir skráningu á viðburðum og birtingu þeirra. Admin get búið til viðburði, eytt þeim og breytt þeim, einnig getur hann birt alla notendur, búið til notendur og eytt þeim. Auðkenndir notendur (Admin líka) get fengið upplýsingar um allar skráningar á viðburði, skráð sig á viðburð og afskráð sig af viðburði. Óauðkenndur notandi getur bara fengið upplýsingar um viðburði. Nota skal npm run setup til að setja upp gagnagrunn og npm run dev til að keyra vefþjónustuna.

Innskáning fyrir admin er { "username": "admin", "password":"123"}

## CRUD leiðbeiningar

Nýskráning: 
POST {baseURL}/register - býr til notenda aðgang.

Innskráning: 
POST {baseURL}/login - skráir notanda inn og gefur honumm access token.

---------------------------------------------------------------------------------------------
Admin only: 

GET {baseURL}/admin - birtir upplýsingar fyrir admin hvaða aðferðir hann getur gert.

GET {baseURL}/users - birtir upplýsingar um notendur í gagnagrunn.

POST {baseURL}/user - býr til nýjan notanda.

DELETE {baseURL}/user/:id - eyðir notanda eftir id.

POST {baseURL}/events - býr til nýjan viðburð.

PATCH {baseURL}/events/:id - uppfærir upplýsingar um viðburð eftir id.

DELETE {baseURL}/events/:id - eyðir viðburði eftir id.
 
---------------------------------------------------------------------------------------------
Admin og innskráður notandi:

GET {baseURL}/registrations - birtir allar skráningar á viðburði.

GET {baseURL}/registrations/:id - birtir upplýsingar um skráningu á viðburði eftir id.

DELETE {baseURL}/registrations/:id - eyðir skráningu eftir id.

POST {baseURL}/registrations - skráir notanda á viðburð.

---------------------------------------------------------------------------------------------
Óauðkenndir notendur (Allir):

GET (baseURL)/ - birtir upplýsingar um hvað óauðkenndur notandi getur gert.

GET {baseURL}/events - birtir upplýsingar um alla viðburði.

GET {baseURL}/events/:id - birtir upplýsingar um viðburð eftir id.

