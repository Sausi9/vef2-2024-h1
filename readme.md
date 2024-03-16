# Vefforritun 2, 2024, Hópverkefni 1

## Meðlimir

Auðun Bergsson aub18@hi.is, Dagur Hall dah51@hi.is, Egill Hrafn Ólafsson eho10@hi.is

## Verkefnið

Við ákvaðum að útbúa vefþjónustu fyrir viðburðarkerfi sem leyfir skráningu á viðburðum og birtingu þeirra. Admin get búið til viðburði, eytt þeim og breytt þeim, einnig getur hann birt alla notendur, búið til notendur og eytt þeim. Auðkenndir notendur (Admin líka) get fengið upplýsingar um allar skráningar á viðburði, skráð sig á viðburð og afskráð sig af viðburði. Óauðkenndur notandi getur bara fengið upplýsingar um viðburði. Nota skal npm run setup til að setja upp gagnagrunn og npm run dev til að keyra vefþjónustuna.

Innskáning fyrir admin er { "username": "admin", "password":"123"}

## Leiðbeiningar

Keyra eftirfarandi til að still upp verkefnið.

```
npm run setup 
npm run dev
```

Setup bætir 30 viðburðum í events töflu sem voru fengnir út frá hópverkefni 2 í vefforitun 1 2022. Myndir fyrir events voru fengnar af picsum. Setup bætir 6 notendum í users töflu, sem hafa allir passwordið 123 og 1 af þessum notendum er admin, hinir ekki. Síðan eru 5 skráningar settar í registration töfluna. Síðan mun dev keyra upp server.

## CRUD leiðbeiningar

Nýskráning: 
POST {baseURL}/register - býr til notenda aðgang.

t.d. {"username":"nafn", "password": "lykilorð"}

Innskráning: 
POST {baseURL}/login - skráir notanda inn og gefur honum access token.

t.d. {"username":"nafn", "password": "lykilorð"}

---------------------------------------------------------------------------------------------
Admin only: 

GET {baseURL}/admin - birtir upplýsingar fyrir admin hvaða aðferðir hann getur gert.

GET {baseURL}/users - birtir upplýsingar um notendur í gagnagrunn.

POST {baseURL}/user - býr til nýjan notanda.

t.d. {"username": "nafn", "password": "lykilorð"}


DELETE {baseURL}/user/:id - eyðir notanda eftir id.

POST {baseURL}/events - býr til nýjan viðburð.

t.d. {"title": "titill","place": "staðsetning","date": "dagsetning","imageURL": "slóð myndar á disk"}

PATCH {baseURL}/events/:id - uppfærir upplýsingar um viðburð eftir id.

t.d. {"title": "breytturtitill","place": "breyttstaðsetning","date": "dagsetning","imageURL": "slóð myndar á disk"}

DELETE {baseURL}/events/:id - eyðir viðburði eftir id.
 
---------------------------------------------------------------------------------------------
Admin og innskráður notandi:

GET {baseURL}/registrations - birtir allar skráningar á viðburði.

GET {baseURL}/registrations/:id - birtir upplýsingar um skráningu á viðburði eftir id.

DELETE {baseURL}/registrations/:id - eyðir skráningu eftir id.

POST {baseURL}/registrations - skráir notanda (sem er til) á viðburð (sem er til).

t.d. {"username": "nafn notanda", "eventTitle": "heiti vidburdar"}

---------------------------------------------------------------------------------------------
Óauðkenndir notendur (Allir):

GET (baseURL)/ - birtir upplýsingar um hvað óauðkenndur notandi getur gert.

GET {baseURL}/events - birtir upplýsingar um alla viðburði.

GET {baseURL}/events/:id - birtir upplýsingar um viðburð eftir id.

