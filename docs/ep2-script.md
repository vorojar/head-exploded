> Historical research draft / 历史研究草稿。2026-11-15 修订后的当前内容以 `remotion/src/lesson-copy.json` 和 [医学审校记录](medical-review.md) 为准。不要使用本草稿重新生成旁白。

# Episode 2 — Sutures, Foramina & Clinical Points

**Series:** 3D Skull Anatomy (Remotion + Three.js, real BodyParts3D meshes)
**Status:** Script draft — research-verified, 2026-11-15. No code written; this file is the script only.
**Format (matches Episode 1):** ~15 short segments. Each segment has one English narration paragraph (2–3 sentences, word-for-word as spoken), an on-screen label in English + Latin, and the Episode 1 "protagonist camera" framing the featured structure. All narration and on-screen text is native professional anatomical English (Terminologia Anatomica terms). No Chinese anywhere in the video.
**Length:** 15 segments, 525 words of narration, ≈ 2 min 40 s at Episode 1's measured pace (≈ 3.3 words/sec). Per-segment word counts are given so the TTS durations can be measured exactly, as in Episode 1 — measure the real narration durations before locking segment windows.

## Production notes (read before building)

1. **Suture segments (2–6) use NO dimming.** In Episode 1 the featured bone stays full-colour and the rest dim to 45%. That would hide a suture. For sutures, keep all bones at full colour; the suture is the boundary between them. The camera frames the suture line and the label points at it.
2. **Two new staging modes are required — neither exists in Episode 1:**
   - **Vault-away (segments 7–12):** the calvaria — frontal bone + both parietal bones — lifts up and away as a group, and the camera looks down into the cranial cavity. The middle and posterior cranial fossa foramina are only visible this way; they cannot be seen on the intact outer skull.
   - **Group explosion (segment 14):** the five small facial bones explode forward together, while the maxilla and zygomatic bones dim to 45% (the Episode 1 dimming mechanism) so the small bones read clearly.
3. **Foramina contents are taught by narration + labels only.** There is no brain, meninges, nerve, or vessel mesh. If simple nerve/vessel tubes are added later, the foramina segments would be stronger — as scripted, the contents are words, not objects.
4. **The small facial bones (segment 14) are the fix for Episode 1's known weakness:** in Episode 1's final panorama the dots for bones 16–22 crowd together. This segment gives them their own close-up.

---

## Segment list

### 1. intro — "Not one bone"
- **Featured:** Whole skull, assembled.
- **Narration (23 words, ~7 s):** "The skull is not one bone. Twenty-two bones lock together at sutures, and are pierced by foramina — doorways for nerves and vessels."
- **On-screen label:** none (title card is not burned in, per series rules).
- **Key facts:** Sutures are fibrous joints; foramina are the passages for nerves and vessels.
- **Camera:** Assembled. Standard 3/4 view (front-right-top), wide, full skull — same framing as the Episode 1 intro.
- **Staging:** Assembled, all bones full colour.

### 2. coronal — Coronal suture
- **Featured:** Frontal bone + both parietal bones.
- **Narration (29 words, ~9 s):** "The coronal suture. It runs across the top of the skull, joining the frontal bone to the two parietal bones. Where it meets the sagittal suture is the bregma."
- **On-screen label:** Coronal suture — *Sutura coronalis*. Secondary label: Bregma.
- **Key facts:** Joins frontal + parietals; runs side-to-side across the vault; its meeting point with the sagittal suture is the bregma (the anterior fontanelle in infants).
- **Camera:** Assembled, no dimming. High front-top 3/4 view, looking down the forehead so the suture line reads across the vault.
- **Staging:** Assembled, all bones full colour.

### 3. sagittal — Sagittal suture
- **Featured:** Parietal bones, left and right.
- **Narration (29 words, ~9 s):** "The sagittal suture runs along the midline, joining the left and right parietal bones. It meets the coronal suture at the bregma, and the lambdoid suture at the lambda."
- **On-screen label:** Sagittal suture — *Sutura sagittalis*. Secondary labels: Bregma, Lambda.
- **Key facts:** Joins the two parietals along the midline; the superior sagittal sinus runs in a groove just beneath it; bregma anterior, lambda posterior.
- **Camera:** Assembled, no dimming. TOP view — camera directly above, looking straight down the midline.
- **Staging:** Assembled, all bones full colour.

### 4. lambdoid — Lambdoid suture
- **Featured:** Parietal bones + occipital bone.
- **Narration (29 words, ~9 s):** "The lambdoid suture. It runs across the back of the skull, joining the parietal bones to the occipital bone. Its meeting point with the sagittal suture is the lambda."
- **On-screen label:** Lambdoid suture — *Sutura lambdoidea*. Secondary label: Lambda.
- **Key facts:** Joins parietals (+ mastoid part of temporal) to the occipital; runs like an upside-down V across the back; lambda is its meeting point with the sagittal suture (the posterior fontanelle in infants).
- **Camera:** Assembled, no dimming. Back-top view — camera behind and above the skull.
- **Staging:** Assembled, all bones full colour.

### 5. squamous — Squamous suture
- **Featured:** Parietal bone + temporal bone.
- **Narration (29 words, ~9 s):** "The squamous suture arches across the side of the skull, joining the parietal bone to the temporal bone. Its name means scale — the two bones overlap like scales."
- **On-screen label:** Squamous suture — *Sutura squamosa*.
- **Key facts:** Joins the parietal bone to the squamous part of the temporal bone; a bevelled, overlapping joint (Latin *squama*, scale); arches above the ear, one on each side.
- **Camera:** Assembled, no dimming. Side view — camera on the right side, slightly above, framing the arch above the ear.
- **Staging:** Assembled, all bones full colour.

### 6. pterion — Pterion + epidural hematoma (clinical anchor)
- **Featured:** Frontal + parietal + temporal + sphenoid (greater wing).
- **Narration (37 words, ~11 s — longest suture segment, deliberate):** "The pterion: where frontal, parietal, temporal, and sphenoid meet. It is the thinnest part of the skull, and the middle meningeal artery runs beneath it. A fracture here can tear the artery and cause an epidural hematoma."
- **On-screen label:** Pterion — *Pterion*. Secondary label: Middle meningeal artery — *A. meningea media*.
- **Key facts:** Four-bone junction on the side of the skull, just behind the temple; thinnest part of the cranial wall; the anterior branch of the middle meningeal artery (which enters the skull through the foramen spinosum) runs just beneath it. See Clinical Point 1 for the full mechanism, lucid interval, and CT appearance.
- **Camera:** Assembled, no dimming. Side close-up — camera on the side, low, tight on the temple region where the four bones meet.
- **Staging:** Assembled, all bones full colour.

### 7. cranial-base — Opening the skull (transition)
- **Featured:** Cranial cavity floor (three fossae).
- **Narration (34 words, ~10 s):** "Now we open the skull. With the vault lifted away, the floor of the cranial cavity appears, divided into three fossae. Every foramen we are about to see is a doorway in this floor."
- **On-screen labels:** Anterior cranial fossa — *Fossa cranii anterior*; Middle cranial fossa — *Fossa cranii media*; Posterior cranial fossa — *Fossa cranii posterior*.
- **Key facts:** The cranial base has three hollows — anterior, middle, posterior fossae — and every foramen in this episode sits in one of them.
- **Camera:** Vault-away staging. Frontal + both parietal bones lift up and out; camera moves above, looking down into the cranial cavity (top-down).
- **Staging:** NEW — calvaria lifted away as a group. All remaining bones full colour.

### 8. cribriform — Cribriform plate + CSF leak (clinical anchor)
- **Featured:** Ethmoid bone (cribriform plate).
- **Narration (43 words, ~13 s):** "The cribriform plate. This sieve-like plate of the ethmoid bone forms the roof of the nasal cavity. The filaments of the olfactory nerve pass through its tiny holes. A fracture here causes loss of smell, and cerebrospinal fluid can leak from the nose."
- **On-screen label:** Cribriform plate — *Lamina cribrosa*. Secondary label: Olfactory filaments — *Fila olfactoria* (CN I).
- **Key facts:** A perforated horizontal plate of the ethmoid; the fila olfactoria (CN I) pass through its ~20–40 tiny foramina to the olfactory bulb above. See Clinical Point 2 for the fracture mechanism (anosmia + CSF rhinorrhea + meningitis risk).
- **Camera:** Vault away. Top-down into the anterior fossa, close on the midline ethmoid plate (the perforated strip flanking the crista galli).
- **Staging:** Vault away. The individual foramina are ~1 mm and will NOT resolve individually on the mesh — show the plate as a region, not as separate holes (see Accuracy Notes).

### 9. optic-canal — Optic canal
- **Featured:** Sphenoid bone (lesser wing).
- **Narration (34 words, ~10 s):** "The optic canal. This tunnel in the lesser wing of the sphenoid carries the optic nerve and the ophthalmic artery into the orbit. It is the only way for vision to leave the skull."
- **On-screen label:** Optic canal — *Canalis opticus*. Secondary labels: Optic nerve (CN II) — *N. opticus*; Ophthalmic artery — *A. ophthalmica*.
- **Key facts:** A short canal in the lesser wing of the sphenoid, at the apex of the orbit; transmits CN II + ophthalmic artery; the only exit route for the visual pathway.
- **Camera:** Vault away. Top-down / front-above, close on the sphenoid midline, just lateral to the midline behind the orbit.
- **Staging:** Vault away. Not visible on the intact outer skull — the vault-away staging is what makes it visible.

### 10. sof — Superior orbital fissure
- **Featured:** Sphenoid bone (greater + lesser wings).
- **Narration (39 words, ~12 s):** "The superior orbital fissure. This cleft between the wings of the sphenoid carries the nerves that move the eye — the third, fourth, and sixth cranial nerves — the ophthalmic division of the fifth, and the superior ophthalmic vein."
- **On-screen label:** Superior orbital fissure — *Fissura orbitalis superior*. Secondary label: CN III, IV, V1, VI.
- **Key facts:** A cleft between the greater and lesser wings of the sphenoid; transmits CN III (superior + inferior divisions), CN IV, CN V1 (lacrimal, frontal, nasociliary branches), CN VI, and the superior ophthalmic vein. CN II is NOT here — it takes the optic canal (segment 9); that distinction is the classic exam point, and the basis of superior orbital fissure syndrome (Rochon-Duvigneaud), in which vision is spared.
- **Camera:** Vault away. Same staging as segment 9, camera shifted slightly lateral and inferior — the fissure lies just below and lateral to the optic canal.
- **Staging:** Vault away. The fissure is a narrow slit, not a round hole — show it as a labelled region.

### 11. sphenoid-trio — Foramen rotundum, ovale, spinosum
- **Featured:** Sphenoid bone (greater wing).
- **Narration (41 words, ~12 s):** "Three holes in a row across the sphenoid. The foramen rotundum carries the maxillary nerve, the second division of the trigeminal. Behind it, the foramen ovale carries the mandibular nerve, the third division, and the foramen spinosum carries the middle meningeal artery."
- **On-screen labels:** Foramen rotundum — *Foramen rotundum* (Maxillary nerve, V2 — *N. maxillaris*); Foramen ovale — *Foramen ovale* (Mandibular nerve, V3 — *N. mandibularis*); Foramen spinosum — *Foramen spinosum* (Middle meningeal artery — *A. meningea media*).
- **Key facts:** The three holes run in a row across the greater wing, anteromedial to posterolateral, in that order — rotundum, ovale, spinosum. Rotundum: V2 only. Ovale: V3 + accessory meningeal artery (+ lesser petrosal nerve occasionally). Spinosum: middle meningeal artery (+ vein) + meningeal branch of V3. Callback: the middle meningeal artery is the vessel torn at the pterion (segment 6).
- **Camera:** Vault away. Top-down into the middle fossa, framing the greater wing of the sphenoid; the three holes read as a row.
- **Staging:** Vault away.

### 12. iam — Internal acoustic meatus + temporal bone fracture (clinical anchor)
- **Featured:** Temporal bone (petrous part).
- **Narration (41 words, ~12 s):** "The internal acoustic meatus. This opening in the petrous temporal bone carries the facial and vestibulocochlear nerves, with the labyrinthine artery, into the inner ear. A fracture across this bone can injure both nerves — facial weakness, hearing loss, and vertigo."
- **On-screen label:** Internal acoustic meatus — *Meatus acusticus internus*. Secondary labels: Facial nerve (CN VII) — *N. facialis*; Vestibulocochlear nerve (CN VIII) — *N. vestibulocochlearis*.
- **Key facts:** An oval opening on the posterior face of the petrous temporal bone; transmits CN VII, CN VIII, the labyrinthine artery, and the vestibular ganglion. See Clinical Point 3 for the fracture mechanism (transverse fractures carry the highest risk).
- **Camera:** Vault away + occipital exploded back. Camera above-posterior, looking down at the posterior face of the petrous temporal bone.
- **Staging:** Vault away (occipital also lifted away for this segment).

### 13. posterior-base — Foramen magnum, jugular foramen, hypoglossal canal
- **Featured:** Occipital bone + temporal bone (base).
- **Narration (47 words, ~14 s — longest segment, three foramina):** "The base of the skull. The foramen magnum transmits the medulla, the vertebral arteries, and the spinal roots of the accessory nerve. The jugular foramen carries nerves nine, ten, and eleven with the internal jugular vein, and the hypoglossal canal carries the twelfth nerve to the tongue."
- **On-screen labels:** Foramen magnum — *Foramen magnum*; Jugular foramen — *Foramen jugulare* (CN IX, X, XI); Hypoglossal canal — *Canalis hypoglossalis* (CN XII).
- **Key facts:** Foramen magnum (occipital): medulla oblongata + meninges, vertebral arteries, spinal roots of CN XI, anterior/posterior spinal arteries — the largest opening in the skull. Jugular foramen (temporal + occipital): CN IX, X, XI + internal jugular vein + inferior petrosal sinus; pars nervosa (IX) vs pars vascularis (X, XI, vein). Hypoglossal canal (occipital, above the occipital condyle): CN XII, the motor nerve of the tongue.
- **Camera:** Camera BELOW — external base view, looking up. Foramen magnum centred; jugular foramen lateral to it; hypoglossal canal just medial/superior to the jugular foramen, above the occipital condyle.
- **Staging:** Assembled (base view). The hypoglossal canal is only a few millimetres across — flag: verify in render; use a marker dot if the hole itself does not read (see Accuracy Notes).

### 14. facial-cluster — The small bones of the face (close-up)
- **Featured:** Lacrimal, palatine, inferior nasal concha, vomer, nasal bones.
- **Narration (39 words, ~12 s):** "The small bones of the face: lacrimal, palatine, inferior nasal concha, vomer, and nasal. They build the inner wall of the orbit and the walls of the nasal cavity. Small bones, but they shape the face and the airway."
- **On-screen labels:** Lacrimal bone — *Os lacrimale*; Palatine bone — *Os palatinum*; Inferior nasal concha — *Concha nasalis inferior*; Vomer — *Vomer*; Nasal bone — *Os nasale*.
- **Key facts:** Lacrimal: paper-thin, forms the medial wall of the orbit and houses the lacrimal sac. Palatine: forms the posterior hard palate and the lateral wall of the nasal cavity. Inferior nasal concha: a scroll of bone that warms and moistens inhaled air. Vomer: the midline plate of the nasal septum. Nasal: the bridge of the nose. This segment exists because these five crowded together unreadably in Episode 1's final panorama.
- **Camera:** Assembled (face). FRONT close-up. The five small bones explode forward together (~60–80% of their Episode 1 distances) while the maxilla and zygomatic bones dim to 45%, so the small bones read clearly.
- **Staging:** NEW — group explosion of the five small facial bones + dimming of the maxilla/zygomatic.

### 15. recap — Close
- **Featured:** Whole skull, assembled.
- **Narration (31 words, ~9 s):** "Sutures hold the skull together. Foramina let nerves and vessels through. Learn the joints, learn the doorways — and the skull stops being a list of bones, and becomes a map."
- **On-screen label:** none.
- **Key facts:** Recap of the episode's two ideas: sutures = joints, foramina = doorways.
- **Camera:** Assembled, wide 3/4 view, slow pull-back to the full skull — same framing as the Episode 1 close.
- **Staging:** Assembled, all bones full colour.

---

## Sutures — reference table

| English | Latin (TA) | Joins | Clinical / functional note |
|---|---|---|---|
| Coronal suture | *Sutura coronalis* | Frontal bone + both parietal bones | Bregma where it meets the sagittal suture (anterior fontanelle in infants). The dura is attached along suture lines, so an epidural hematoma cannot cross them. |
| Sagittal suture | *Sutura sagittalis* | Left + right parietal bones | The superior sagittal sinus runs in a groove just beneath it along the midline. Bregma (anterior) and lambda (posterior) are its endpoints. |
| Lambdoid suture | *Sutura lambdoidea* | Parietal bones (+ mastoid part of temporal) + occipital bone | Lambda where it meets the sagittal suture (posterior fontanelle in infants). |
| Squamous suture | *Sutura squamosa* | Parietal bone + squamous part of the temporal bone | A bevelled, overlapping joint — Latin *squama*, scale. One on each side, arching above the ear. |
| Pterion | *Pterion* (junction, not a suture) | Frontal + parietal + temporal + sphenoid (greater wing) | Thinnest part of the cranial wall; the anterior branch of the middle meningeal artery runs beneath it — fracture → epidural hematoma (Clinical Point 1). |

## Foramina — reference table

| English | Latin (TA) | Bone | Contents (exact) | Visibility in these meshes |
|---|---|---|---|---|
| Foramen magnum | *Foramen magnum* | Occipital bone | Medulla oblongata with its meninges; vertebral arteries (V4 segments); spinal roots of the accessory nerve (CN XI); anterior and posterior spinal arteries | Large and obvious from below — the easiest foramen to show. |
| Hypoglossal canal | *Canalis hypoglossalis* | Occipital bone (above the occipital condyle) | Hypoglossal nerve (CN XII). Minor: meningeal branch of the ascending pharyngeal artery, emissary vein | Small (a few mm); visible from below, just medial to the jugular foramen. **Flag:** verify in render; use a marker dot if the hole itself does not read. |
| Jugular foramen | *Foramen jugulare* | Temporal bone (petrous part) + occipital bone | Glossopharyngeal nerve (CN IX); vagus nerve (CN X); spinal accessory nerve (CN XI); internal jugular vein (continuation of the sigmoid sinus); inferior petrosal sinus | Visible from below, lateral to the foramen magnum; large but irregular. **Flag:** partly shadowed by the styloid process and mastoid — best from a below-posterior angle. |
| Optic canal | *Canalis opticus* | Sphenoid bone (lesser wing) | Optic nerve (CN II); ophthalmic artery | NOT visible on the intact outer skull — deep in the orbital apex. Needs the vault-away staging, camera above-front. |
| Superior orbital fissure | *Fissura orbitalis superior* | Sphenoid bone (between greater and lesser wings) | Oculomotor nerve (CN III, superior + inferior divisions); trochlear nerve (CN IV); ophthalmic nerve (CN V1: lacrimal, frontal, nasociliary branches); abducent nerve (CN VI); superior ophthalmic vein (inferior ophthalmic vein variably) | A narrow slit, not a round hole. Visible only with the vault-away staging, from above-front. Show as a labelled region. |
| Foramen rotundum | *Foramen rotundum* | Sphenoid bone (greater wing) | Maxillary nerve (CN V2) | Opens into the pterygopalatine fossa (not visible from below). Best from the vault-away top-down view of the middle fossa. |
| Foramen ovale | *Foramen ovale* | Sphenoid bone (greater wing) | Mandibular nerve (CN V3); accessory meningeal artery; lesser petrosal nerve (occasionally); emissary vein (cavernous sinus ↔ pterygoid plexus) | Visible from the vault-away top-down view and from below (opens into the infratemporal fossa). |
| Foramen spinosum | *Foramen spinosum* | Sphenoid bone (greater wing, posterolateral to ovale) | Middle meningeal artery (and vein); meningeal branch of the mandibular nerve (*nervus spinosus*) | Small; visible from the vault-away top-down view and from below; sits just behind the spine of the sphenoid. |
| Cribriform plate | *Lamina cribrosa* (individual holes: *foramina cribrosa*) | Ethmoid bone | Olfactory nerve filaments, *fila olfactoria* (CN I). Minor: anterior ethmoidal artery and vein | The plate is visible top-down in the anterior fossa, but the individual foramina are ~1 mm and will NOT resolve individually on the mesh — show the plate as a region. **Flag.** |
| Internal acoustic meatus | *Meatus acusticus internus* | Temporal bone (petrous part, posterior face) | Facial nerve (CN VII); vestibulocochlear nerve (CN VIII); labyrinthine artery; vestibular ganglion | Intracranial only — visible from the vault-away top-down/posterior view of the posterior fossa; not visible from outside. |

---

## Clinical points (3 — highest yield)

### 1. Pterion fracture → epidural (extradural) hematoma
**Mechanism (one sentence):** A blow to the temple fractures the thin pterion and tears the anterior branch of the middle meningeal artery, and arterial blood strips the dura from the inner skull, forming a lens-shaped (biconvex) hematoma that cannot cross suture lines.
**Supporting detail (not narrated, for key-facts/labels):** Classic course is a brief loss of consciousness, a lucid interval, then rapid deterioration — a neurosurgical emergency; on CT the collection is biconvex and suture-limited (unlike a crescent-shaped subdural hematoma, which is venous and crosses sutures); expansion can cause uncal herniation and a blown pupil (CN III compression) on the same side.

### 2. Cribriform plate fracture → anosmia + CSF rhinorrhea
**Mechanism (one sentence):** A fracture of the thin cribriform plate shears the delicate olfactory filaments as they pass through its foramina, causing loss of smell, and tears the adherent dura and arachnoid, opening the subarachnoid space into the nasal cavity so cerebrospinal fluid leaks from the nose.
**Supporting detail:** Clear, watery rhinorrhea after head trauma is a CSF leak until proven otherwise (tested for beta-2 transferrin); the open fistula is a direct route for meningitis, so this is not a benign nosebleed.

### 3. Petrous temporal bone fracture → facial + vestibulocochlear nerve injury
**Mechanism (one sentence):** A transverse fracture across the petrous temporal bone crosses the facial canal and the otic capsule, injuring the facial nerve and the vestibulocochlear nerve — facial weakness on that side, with sensorineural hearing loss and vertigo.
**Supporting detail:** Transverse fractures cause facial paralysis in ~40–50% of cases (vs ~20% for longitudinal fractures, which more often cause conductive hearing loss from ossicular disruption); immediate complete palsy suggests the nerve is severed or crushed, delayed palsy usually means edema within an intact nerve.

---

## Latin names — all 22 bones

| # | English | Latin (TA98 / standard textbooks) | TA2 variant, if different | Notes |
|---|---|---|---|---|
| 1 | Frontal bone | *Os frontale* | — | Single |
| 2 | Parietal bone (L) | *Os parietale* | — | *Os parietale sinistrum* |
| 3 | Parietal bone (R) | *Os parietale* | — | *Os parietale dextrum* |
| 4 | Temporal bone (L) | *Os temporale* | — | *Os temporale sinistrum* |
| 5 | Temporal bone (R) | *Os temporale* | — | *Os temporale dextrum* |
| 6 | Occipital bone | *Os occipitale* | — | Single |
| 7 | Sphenoid bone | *Os sphenoidale* | *Os sphenoideum* (TA2) | Single. TA2 renamed it; most textbooks still print *os sphenoidale*. |
| 8 | Ethmoid bone | *Os ethmoidale* | *Os ethmoideum* (TA2) | Single. Same TA2 renaming as the sphenoid. |
| 9 | Nasal bone (L) | *Os nasale* | — | *Os nasale sinistrum* |
| 10 | Nasal bone (R) | *Os nasale* | — | *Os nasale dextrum* |
| 11 | Maxilla (L) | *Maxilla* | — | No "os" in TA |
| 12 | Maxilla (R) | *Maxilla* | — | No "os" in TA |
| 13 | Zygomatic bone (L) | *Os zygomaticum* | — | *Os zygomaticum sinistrum* |
| 14 | Zygomatic bone (R) | *Os zygomaticum* | — | *Os zygomaticum dextrum* |
| 15 | Mandible | *Mandibula* | — | Single; no "os" in TA |
| 16 | Lacrimal bone (L) | *Os lacrimale* | — | *Os lacrimale sinistrum* |
| 17 | Lacrimal bone (R) | *Os lacrimale* | — | *Os lacrimale dextrum* |
| 18 | Palatine bone (L) | *Os palatinum* | — | *Os palatinum sinistrum* |
| 19 | Palatine bone (R) | *Os palatinum* | — | *Os palatinum dextrum* |
| 20 | Inferior nasal concha (L) | *Concha nasalis inferior* | — | No "os" in TA |
| 21 | Inferior nasal concha (R) | *Concha nasalis inferior* | — | No "os" in TA |
| 22 | Vomer | *Vomer* | — | Single; no "os" in TA |

Side suffixes: right = *dexter/dextrum*, left = *sinister/sinistrum* (agreeing with the noun's gender; *os* is neuter, so *dextrum/sinistrum*).

---

## Accuracy notes (flags for the build)

1. **TA2 vs TA98 Latin forms.** Terminologia Anatomica 2nd edition (TA2, current) renamed the sphenoid and ethmoid to *os sphenoideum* and *os ethmoideum*; TA98 and most textbooks print *os sphenoidale* and *os ethmoidale*. This script uses the TA98/textbook forms (matching the brief and what students will see in most books) and lists the TA2 variants in the table above.
2. ***Sutura squamosa* vs *sutura squamosal*.** The standard textbook/TA form is *sutura squamosa*; one TA-code listing renders it as "sutura squamosal". The script uses *sutura squamosa*.
3. **Foramen lacerum deliberately omitted.** It is filled with cartilage in life and transmits no major nerve or vessel (only small meningeal branches); it is not high-yield and not a clean hole in the meshes. The carotid canal (internal carotid artery, petrous temporal bone) is likewise omitted from this episode — a natural addition for a third episode on the cranial base vessels.
4. **Visibility flags (see the foramina table):** the hypoglossal canal is only a few millimetres across — verify it reads in a test render, and use a marker dot if the hole itself does not; the cribriform foramina (~1 mm) will NOT resolve individually — show the plate as a region; the superior orbital fissure is a slit, not a round hole; the optic canal, superior orbital fissure, rotundum, ovale, spinosum, cribriform plate, and internal acoustic meatus are all invisible on the intact outer skull and depend on the new vault-away staging.
5. **New staging modes (segments 7–12, 14).** The Episode 1 system explodes individual bones and frames them with the protagonist camera. Episode 2 additionally needs (a) the whole calvaria (frontal + parietals) lifting away as a group, and (b) a five-bone group explosion for the facial cluster. Both must be built and verified with test stills before any full render — especially the top-down intracranial views, which have never been rendered in this series.
6. **Occasional/variable contents flagged in the table, not in the narration:** the lesser petrosal nerve passes through the foramen ovale only occasionally; the inferior ophthalmic vein passes through the superior orbital fissure variably. The narration states only the constant contents.
7. **"Only way for vision to leave the skull" (segment 9).** True for the optic nerve (CN II) — it has no other exit. The ophthalmic artery also uses the canal, and small orbital branches exist, but the statement as narrated (about vision) is accurate.
8. **Durations are estimates.** Word counts assume Episode 1's measured pace (~3.3 words/sec). Measure the real TTS durations for each segment before locking windows, exactly as in Episode 1 (window = narration + 0.6 s).

---

## Sources (foramina contents, sutures, Latin terms, clinical points)

- StatPearls — Anatomy, Head and Neck, Skull Foramen. https://www.statpearls.com/ArticleLibrary/viewarticle/56569
- StatPearls — Anatomy, Head and Neck: Jugular Foramen. https://www.statpearls.com/articlelibrary/viewarticle/36073/
- StatPearls — Anatomy, Head and Neck, Orbit Bones. https://www.statpearls.com/articlelibrary/viewarticle/32190/
- TeachMeAnatomy — Cranial Foramina. https://teachmeanatomy.info/head/osteology/cranial-foramina/
- Kenhub — The Occipital Bone; The Cranial Sutures. https://staging.kenhub.com/en/library/anatomy/the-occipital-bone · https://www.kenhub.com/en/library/anatomy/the-cranial-sutures
- Edwards et al. — Cranial Nerve Foramina, Part II: Posterior Cranial Fossa. Cureus 10(4): e2500. https://docslib.org/download/8146734/cranial-nerve-foramina-part-ii-a-review-of-the-anatomy-and-pathology-of-cranial-nerve-foramina-of-the-posterior-cranial-fossa
- Wikipedia — List of foramina of the human body. https://en.wikipedia.org/wiki/List_of_foramina_of_the_human_body
- Wikipedia — Pterion. https://en.wikipedia.org/wiki/Pterion
- MSD Manual (Professional Edition) — Temporal Bone Fractures. https://www.msdmanuals.com/en-nz/professional/injuries-poisoning/facial-trauma/temporal-bone-fractures
- RSNA — Temporal Bone Trauma: Typical CT and MRI Appearances. https://pubs.rsna.org/doi/10.1148/rg.2020190023
- JASI / Ovid — Basic Rules for Naming Sutures (Terminologia Anatomica codes A03.1.02). https://www.ovid.com/jnls/joai/fulltext/10.4103/jasi.jasi_166_20~basic-rules-for-naming-sutures
- NasrTech — Skull Bones Names in English, Latin & Arabic (TA2 note on *os sphenoideum* / *os ethmoideum*). https://www.nasrtech.dev/blog/skull-bones-names/
- FirstPassPA — Epidural Hematoma. https://www.firstpasspa.com/diagnoses/epidural-hematoma/
- AnatomyAI Tutor — Foramina of the Skull (cribriform plate fracture: anosmia + CSF rhinorrhea). https://www.anatomyaitutor.com/blog/foramina-of-skull-complete-guide-cranial-nerve-passage
