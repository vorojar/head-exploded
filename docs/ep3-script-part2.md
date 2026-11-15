# Episode 3 (Part 2) — TMJ, Le Fort Fractures & Base-of-Skull Fracture Signs

**Series:** 3D Skull Anatomy (Remotion + Three.js, real BodyParts3D meshes)
**Status:** Script draft — research-verified, 2026-11-15. No code written; this file is the script only.
**Scope:** Part 2 of the Episode 3 script — Blocks 3–5 only. Part 1 (Blocks 1–2: the cranial-nerve–foramen map and the orbit) is a separate file. The episode intro and recap live in Part 1 / assembly; this file continues from there.
**Format (matches Episodes 1–2):** 8 short segments. Each segment has one English narration paragraph (word-for-word as spoken), an on-screen label in English + Latin, and the "protagonist camera" framing the featured structure. All narration and on-screen text is native professional anatomical English (Terminologia Anatomica terms). No Chinese anywhere in the video.
**Length:** 8 segments, 278 words of narration, ≈ 1 min 32 s at ~3.0 words/sec (Episode 2 measured ~3.3 words/sec; measure the real TTS durations before locking segment windows, exactly as in Episodes 1–2 — window = narration + 0.6 s).

## Production notes (read before building)

1. **Two new overlay modes are required — neither exists in Episodes 1–2:**
   - **Fracture lines (segments 4–6):** each Le Fort line is drawn as a projected overlay line on the assembled skull (animated, drawn progressively during the segment). It is a 2D overlay, not a mesh change — the bone is not split. See the waypoint lists in each segment; the implementer converts them to projected line points.
   - **Soft-tissue sign overlays (segments 7–8):** bruising (Battle's sign, raccoon eyes) and CSF drips are soft-tissue/fluid signs. They do not exist on the bone mesh. Show them as schematic overlays — a soft dark-red/blue patch for bruising, a thin animated drip line for CSF — never as a mesh change.
2. **The TMJ disc is not in the mesh (segment 1).** The disc is fibrocartilage (soft tissue). The joint space will read as a gap between the condyle and the fossa. Teach the disc by narration + label only; do not invent a disc mesh.
3. **The mandibular canal is inside the bone (segment 3).** It is invisible on the surface mesh. Only its two openings — the mandibular foramen (medial ramus) and the mental foramen (lateral body) — are visible landmarks. The canal's course is carried by the narration.
4. **The pterygoid plates are hidden from the front (segments 4–6).** Every Le Fort fracture involves the pterygoid plates, but they sit on the underside/posterior of the sphenoid and are not visible from the front view. Draw each fracture line on the visible front/lateral surface and let the narration state the pterygoid-plate involvement; do not force the line around the back of the skull.
5. **Segment 2 needs a small new staging move:** the mandible translates forward so the condyle sits in front of the articular eminence (demonstrating the dislocation), then returns. This is a simple position offset of the mandible mesh — no new geometry.

---

## Segment list

### 1. tmj — The temporomandibular joint
- **Featured:** Mandible (condyle) + temporal bone (mandibular fossa).
- **Narration (31 words, ~10 s):** "The temporomandibular joint. The condyle of the mandible sits in the mandibular fossa of the temporal bone, with a fibrocartilage disc between them — the most used joint in the body."
- **On-screen labels:** Temporomandibular joint — *Articulatio temporomandibularis*. Secondary labels: Mandibular condyle — *Condylus mandibulae*; Mandibular fossa — *Fossa mandibularis*; Articular disc — *Discus articularis*.
- **Key facts:** A synovial joint, but atypical — its articular surfaces are lined by fibrocartilage, not hyaline cartilage. The disc divides the joint into a superior compartment (gliding/translation) and an inferior compartment (hinge/rotation). The condyle is about 20 mm mediolaterally and 10 mm anteroposteriorly. The two joints work as one — movement on one side is inseparable from the other. Used thousands of times a day in speaking, chewing, and swallowing.
- **Camera:** Assembled. Side close-up — camera on the side, tight on the joint just in front of the ear.
- **Staging:** Assembled. Mandible + temporal bone full colour, rest dimmed to 45% (the Episode 1 dimming mechanism).

### 2. tmj-dislocation — Dislocation and the condylar neck (clinical anchor)
- **Featured:** Mandibular condyle + articular eminence of the temporal bone.
- **Narration (34 words, ~11 s):** "Yawn too wide, and the condyle slips in front of the articular eminence and locks the jaw open. A blow to the chin can break the condylar neck instead — the mandible's weak point."
- **On-screen labels:** Articular eminence — *Tuberculum articulare*. Secondary label: Condylar neck — *Collum mandibulae*.
- **Key facts:** Anterior dislocation is the commonest TMJ dislocation; it is usually spontaneous (yawning, laughing, dental work) rather than traumatic, and more often bilateral than unilateral. The mouth locks open and cannot close; reduction is manual (down and back). The condylar neck is the thin, weak part of the mandible and a common fracture site. See Clinical Point 1 for the full mechanism.
- **Camera:** Assembled. Side close-up, same framing as segment 1, slightly wider to show the condyle's path forward over the eminence.
- **Staging:** NEW — the mandible translates forward so the condyle sits in front of the articular eminence (demonstrating the dislocation), holds, then returns. Simple position offset of the mandible mesh.

### 3. tmj-nerve — The mandibular canal and the mental foramen
- **Featured:** Mandible (mandibular canal, mental foramen).
- **Narration (37 words, ~12 s):** "The mandibular canal. The inferior alveolar nerve enters at the mandibular foramen, runs inside the bone to the teeth, and leaves through the mental foramen as the mental nerve. Block it there, and the jaw goes numb."
- **On-screen labels:** Mandibular canal — *Canalis mandibulae*; Mental foramen — *Foramen mentale*. Secondary labels: Inferior alveolar nerve — *N. alveolaris inferior*; Mental nerve — *N. mentalis*.
- **Key facts:** The inferior alveolar nerve is a branch of the mandibular nerve (CN V3, from the foramen ovale — Episode 2, segment 11). It enters the mandible through the mandibular foramen on the medial surface of the ramus, travels in the canal giving dental branches to the lower teeth, and exits through the mental foramen (on the outer surface of the body, near the second premolar) as the mental nerve, supplying the lower lip and chin. The inferior alveolar nerve block — anaesthetic injected near the mandibular foramen — is the commonest dental anaesthetic; it numbs the lower teeth, lip, and chin on that side.
- **Camera:** Assembled. Side-front 3/4 view of the mandible, close on the body of the mandible; the mental foramen is on the outer (lateral) surface near the premolars.
- **Staging:** Assembled. Mandible full colour, rest dimmed. The canal itself is invisible (inside the bone) — show the entry (mandibular foramen) and exit (mental foramen) as labelled points. **Flag:** verify both foramina read in a test render; use marker dots if the holes do not read (the mental foramen is only a few millimetres across).

### 4. lefort-1 — Le Fort I (horizontal / Guérin fracture)
- **Featured:** Maxilla, anterior nasal aperture, pterygoid plates.
- **Narration (36 words, ~12 s):** "Le Fort one. A horizontal fracture across the maxilla, just above the teeth and below the orbits. It separates the hard palate and the upper teeth from the rest of the face — a floating palate."
- **On-screen label:** Le Fort I fracture — *Fractura Le Fort I* (eponym; no TA Latin term).
- **Key facts:** A horizontal fracture (Guérin fracture). It separates the hard palate and the upper dentition from the midface; the detached segment is the "floating palate". Involvement of the nasal aperture differentiates it from Le Fort II and III. Like all Le Fort fractures, it involves the pterygoid plates of the sphenoid.
- **Fracture line waypoints (for the overlay, in order):** (1) lateral margin of the anterior nasal aperture; (2) above the nasal floor; (3) laterally above the canine fossa; (4) across the lateral wall of the maxillary sinus; (5) below the zygomatic buttress; (6) upward and posteriorly across the pterygomaxillary fissure; (7) through the pterygoid plates at the junction of their lower third and upper two-thirds.
- **Camera:** Assembled. FRONT view, full face, so the horizontal line reads across the maxilla.
- **Staging:** Assembled, all bones full colour. NEW — the fracture line is drawn as a projected overlay line (animated, drawn progressively). The pterygoid-plate portion (waypoint 7) is hidden from the front — the line ends at the pterygomaxillary fissure and the narration states the rest (see Production Note 4).

### 5. lefort-2 — Le Fort II (pyramidal fracture)
- **Featured:** Nasal bones, maxilla, inferior orbital rim.
- **Narration (33 words, ~11 s):** "Le Fort two. A pyramid — apex at the nose, base at the teeth. The line runs from the nasal bones, across the inferior orbital rim, and down the maxilla on both sides."
- **On-screen label:** Le Fort II fracture — *Fractura Le Fort II*.
- **Key facts:** A pyramidal fracture. Apex at the nasofrontal suture, base at the teeth. Its defining feature is involvement of the inferior orbital rim — that is what separates it from Le Fort I. It detaches the central midface (nose + upper jaw) from the rest of the face.
- **Fracture line waypoints (for the overlay, in order, one side then the other):** (1) nasofrontal suture / nasal bones (the apex); (2) down either side across the frontal process of the maxilla; (3) across the lacrimal bone, just anterior to the nasolacrimal canal; (4) across the inferior orbital rim at the zygomaticomaxillary suture; (5) down the lateral wall of the maxillary sinus, just medial to the zygomaticomaxillary suture; (6) beneath the zygomatic buttress; (7) across the pterygomaxillary fissure; (8) through the pterygoid plates about midway.
- **Camera:** Assembled. FRONT view, so the pyramid shape reads.
- **Staging:** Assembled, all bones full colour. Fracture line drawn as an overlay (pyramid outline, apex at the nose).

### 6. lefort-3 — Le Fort III (transverse / craniofacial disjunction)
- **Featured:** Zygomatic arch, orbits, nasal bones.
- **Narration (32 words, ~11 s):** "Le Fort three. A transverse fracture that detaches the whole midface from the skull. The line runs through the zygomatic arches, across both orbits, and through the nasal bones — craniofacial disjunction."
- **On-screen label:** Le Fort III fracture — *Fractura Le Fort III*.
- **Key facts:** A transverse fracture at the level of the skull base. It completely separates the midface from the cranial vault — craniofacial disjunction. Its defining feature is involvement of the zygomatic arch (invariably). It is the most extensive Le Fort fracture and the highest-energy pattern.
- **Fracture line waypoints (for the overlay, in order):** (1) zygomatic arch (both sides); (2) zygomaticofrontal suture; (3) lateral orbital wall; (4) frontozygomatic and frontomaxillary sutures; (5) nasofrontal suture; (6) medial orbital wall; (7) nasal bones and nasal septum; (8) pterygoid plates.
- **Camera:** Assembled. FRONT view, wide — the transverse line runs across the whole face at the level of the orbits.
- **Staging:** Assembled, all bones full colour. Fracture line drawn as an overlay (one transverse line across the face).

### 7. battle-raccoon — Battle's sign and raccoon eyes
- **Featured:** Mastoid process (temporal bone) + orbits (frontal, maxilla, zygomatic).
- **Narration (37 words, ~12 s):** "Battle's sign and raccoon eyes. Bruising behind the ear, over the mastoid, means a middle cranial fossa fracture. Bruising around both eyes means the anterior fossa. Both appear a day or two later — not at once."
- **On-screen labels:** Battle's sign — *Ecchymosis retroauricularis* (descriptive; the eponym has no TA term); Mastoid process — *Processus mastoideus*. Secondary label: Raccoon eyes — *Ecchymosis periorbitalis*.
- **Key facts:** Battle's sign is bruising behind the ear over the mastoid process — blood tracking from a middle cranial fossa fracture (usually the petrous temporal bone); it is on the same side as the fracture and is highly predictive. Raccoon eyes are bruising around both eyes — blood from an anterior cranial fossa fracture tracking forward under the scalp and into the eyelids; bilateral is highly predictive. The bruise spares the eyelid itself (tarsal plate sparing) because the orbital septum blocks the blood — a useful bedside detail. Both signs are delayed by 1–3 days, so a normal examination at admission does NOT exclude a base-of-skull fracture.
- **Camera:** Assembled. Front-right 3/4 view, framing the mastoid process behind the ear and both orbits together.
- **Staging:** Assembled, all bones full colour. NEW — the bruising is shown as a soft dark-red/blue overlay patch on the mastoid region and around both orbits (schematic; it is a soft-tissue sign, not bone).

### 8. csf-leak — CSF rhinorrhea and otorrhea
- **Featured:** Cribriform plate (ethmoid) + petrous temporal bone.
- **Narration (38 words, ~13 s):** "Cerebrospinal fluid leaking from the nose or the ear means the dura is torn. Clear fluid after trauma is a leak until proven otherwise, an open doorway for meningitis. It can start hours or days after the injury."
- **On-screen labels:** CSF leak — cerebrospinal fluid leak (no single TA term; label the routes instead). Secondary labels: Cribriform plate — *Lamina cribrosa* (callback to Episode 2, segment 8); Dura mater — *Dura mater*.
- **Key facts:** CSF rhinorrhea (fluid from the nose) means an anterior fossa fracture — usually the cribriform plate or the frontal sinus — with a dural tear opening the subarachnoid space into the nasal cavity. CSF otorrhea (fluid from the ear) means a middle fossa / petrous temporal fracture — fluid collects in the middle ear and drains through a perforated eardrum or via the eustachian tube. The "halo sign" (a double ring when bloody fluid is dripped on paper) suggests CSF mixed with blood but is not specific. Any CSF leak is an open route for meningitis. Leaks can be delayed by hours to days after the injury.
- **Camera:** Vault away (Episode 2 staging, reused). Top-down into the cranial cavity, framing the cribriform plate and the petrous temporal bones — the two leak routes.
- **Staging:** Vault away (calvaria lifted, as in Episode 2, segments 7–12). NEW — a thin animated drip line (overlay) from the cribriform plate forward (nose route) and from the petrous temporal laterally (ear route). The fluid itself is an overlay; the mesh shows only the bone.

---

## Le Fort fractures — reference table

| Type | Shape | What it separates | Defining feature | Fracture line (summary) |
|---|---|---|---|---|
| Le Fort I (horizontal / Guérin) | Horizontal | Hard palate + upper teeth from the midface ("floating palate") | Involves the nasal aperture (this is what separates it from II and III) | Lateral nasal aperture → above the nasal floor → above the canine fossa → lateral maxillary sinus wall → below the zygomatic buttress → pterygomaxillary fissure → pterygoid plates (lower third / upper two-thirds junction) |
| Le Fort II (pyramidal) | Pyramid, apex at the nose, base at the teeth | Central midface (nose + upper jaw) from the rest of the face | Involves the inferior orbital rim | Nasofrontal suture → frontal process of maxilla → lacrimal bone → inferior orbital rim (zygomaticomaxillary suture) → lateral maxillary sinus wall → beneath the zygomatic buttress → pterygomaxillary fissure → pterygoid plates (midway) |
| Le Fort III (transverse) | Transverse, at skull-base level | The whole midface from the cranial vault (craniofacial disjunction) | Invariably involves the zygomatic arch | Zygomatic arch → zygomaticofrontal suture → lateral orbital wall → frontozygomatic / frontomaxillary sutures → nasofrontal suture → medial orbital wall → nasal bones + septum → pterygoid plates |

**Common thread (all three):** every Le Fort fracture involves the nasal septum and the pterygoid plates of the sphenoid. The three patterns are Le Fort's "lines of least resistance" (*lineae minoris resistentiae*) — the fracture follows the weakest lines of the facial skeleton, and the vertical buttresses (nasomaxillary, zygomaticomaxillary, pterygomaxillary) are what the lines break through.

## TMJ — reference table

| English | Latin (TA) | Structure / role |
|---|---|---|
| Temporomandibular joint | *Articulatio temporomandibularis* | Synovial joint between the temporal bone above and the mandible below; the two sides work as one joint |
| Mandibular condyle | *Condylus mandibulae* | The head of the mandible — about 20 mm mediolaterally, 10 mm anteroposteriorly; sits in the mandibular fossa |
| Mandibular fossa | *Fossa mandibularis* | The concave socket on the underside of the squamous temporal bone |
| Articular eminence (tubercle) | *Tuberculum articulare* | The convex ridge in front of the fossa; the condyle slides over it when the mouth opens — and past it when the joint dislocates |
| Articular disc | *Discus articularis* | Biconcave fibrocartilage between condyle and fossa; divides the joint into superior (gliding) and inferior (hinge) compartments |
| Condylar neck | *Collum mandibulae* | The thin neck below the condyle — the mandible's weak point in trauma |
| Mandibular canal | *Canalis mandibulae* | The bony tunnel in the body of the mandible carrying the inferior alveolar nerve and vessels |
| Mandibular foramen | *Foramen mandibulae* | Opening on the medial ramus where the inferior alveolar nerve enters the canal |
| Mental foramen | *Foramen mentale* | Opening on the outer body (near the second premolar) where the nerve exits as the mental nerve |
| Inferior alveolar nerve | *N. alveolaris inferior* | Branch of CN V3; sensory to the lower teeth; its block is the commonest dental anaesthetic |
| Mental nerve | *N. mentalis* | Terminal branch of the inferior alveolar nerve; sensory to the lower lip and chin |

## Base-of-skull fracture signs — reference table

| Sign | Where to look (outside) | What broke (inside) | Timing | Predictive value |
|---|---|---|---|---|
| Battle's sign | Bruising behind the ear, over the mastoid process | Middle cranial fossa fracture (usually petrous temporal bone) | Delayed 1–3 days | Highly predictive; essentially 100% in the classic literature (Alter et al., 1974); usually same side as the fracture |
| Raccoon eyes | Bruising around both eyes (periorbital ecchymosis) | Anterior cranial fossa fracture | Delayed 1–3 days | Bilateral is highly predictive; the bruise spares the eyelid itself (tarsal plate sparing — the orbital septum blocks the blood) |
| CSF rhinorrhea | Clear fluid dripping from the nose | Anterior fossa fracture (cribriform plate / frontal sinus) with a dural tear | Hours to days after injury | A leak until proven otherwise (test for beta-2 transferrin); an open route for meningitis |
| CSF otorrhea | Clear fluid from the ear | Middle fossa / petrous temporal fracture; fluid via the middle ear and eustachian tube | Hours to days after injury | Same meningitis risk; may present as a salty taste (fluid draining via the eustachian tube to the throat) |
| Hemotympanum | Blood behind the eardrum (purple tympanic membrane) | Petrous temporal bone fracture | At presentation or delayed | Supports a petrous fracture; often accompanies Battle's sign and CSF otorrhea |

**Localisation logic (the teaching point):** the sign tells you the fossa. Eyes → anterior fossa. Behind the ear → middle fossa. Fluid from the nose → anterior fossa. Fluid from the ear → middle fossa (petrous temporal). Posterior fossa fractures instead present with swallowing difficulty and airway problems (CN IX/X injury) — no external bruise sign.

---

## Clinical points (3 — highest yield)

### 1. TMJ dislocation — the jaw that locks open
**Mechanism (one sentence):** When the mouth opens wide, the condyle normally slides forward over the articular eminence and back again; if it slips too far forward — yawning, laughing, a dental procedure — the muscles spasm and hold it in front of the eminence, so the mouth locks open and cannot close.
**Supporting detail (not narrated, for key-facts/labels):** Anterior dislocation is the commonest TMJ dislocation and is usually spontaneous, not traumatic; bilateral is more common than unilateral. Reduction is manual — the clinician pushes the mandible down and back over the eminence. Posterior, lateral, and superior dislocations are rare and are almost always associated with a fracture of the condyle or temporal bone. A blow to the chin can instead break the condylar neck — the mandible's weak point — which is why a traumatic dislocation must be imaged before reduction.

### 2. Le Fort fractures — one rule for all three
**Mechanism (one sentence):** The midface is held up by vertical buttresses (nasomaxillary, zygomaticomaxillary, pterygomaxillary) and the fracture in every Le Fort type follows the lines of least resistance between them, always breaking the pterygoid plates — so the higher the line, the more of the face comes away.
**Supporting detail:** Le Fort I is the lowest line (teeth and palate only); Le Fort II is a pyramid that takes the nose and the central midface; Le Fort III is the highest line and detaches the entire midface from the skull. The bedside test for a Le Fort I is grasping the upper teeth and rocking them — the whole palate moves. All three are high-energy injuries (usually road traffic accidents) and are commonly associated with other facial fractures, cervical spine injury, and intracranial injury.

### 3. Base-of-skull fracture — read the outside to find the inside
**Mechanism (one sentence):** Blood and cerebrospinal fluid escape through the fracture and track along tissue planes to the surface — behind the ear for a middle fossa fracture, around the eyes for an anterior fossa fracture, out of the nose or ear when the dura is torn — so the external sign localises the internal fracture.
**Supporting detail:** The two rules that make this a teaching point: (a) the signs are delayed by 1–3 days, so a normal examination at admission does NOT exclude a base-of-skull fracture; (b) a CSF leak means the dura is torn and the subarachnoid space is open to the outside world, so the patient is at risk of meningitis and the leak must be found and closed. Battle's sign and bilateral raccoon eyes are the two most predictive signs; unilateral raccoon eyes alone are weaker (they can follow a direct blow to the eye with no fracture at all).

---

## Accuracy notes (flags for the build)

1. **The TMJ disc is soft tissue and is NOT in the mesh.** Segment 1 teaches the disc by narration + label only. The joint space will read as a gap between the condyle and the fossa. Do not invent a disc mesh. The same applies to the joint capsule and ligaments — they are not shown.
2. **The mandibular canal is inside the bone and invisible on the surface mesh (segment 3).** Only the mandibular foramen and the mental foramen are visible landmarks. The canal's course is carried by the narration. Verify both foramina read in a test render; use marker dots if the holes do not read. The mental foramen is only a few millimetres across and sits near the second premolar — its exact position varies between individuals.
3. **The mental foramen's position varies.** It is most often below the second premolar, but it can sit between the premolars or below the first molar. The narration says "near the second premolar" in the key facts only — the on-screen label points at the mesh's foramen wherever it is. Do not hard-code a tooth position into the narration.
4. **Le Fort lines are overlays, not mesh changes (segments 4–6).** The pterygoid-plate portion of each line is hidden from the front view — the line ends at the pterygomaxillary fissure and the narration states the rest. The waypoints are given in anatomical order so the implementer can project them onto the assembled skull; the line should be drawn progressively (animated) during the segment.
5. **Bruising and CSF are overlays, not bone (segments 7–8).** Battle's sign, raccoon eyes, and the CSF drips are soft-tissue/fluid signs. Show them as schematic overlays (soft dark patch / thin drip line). They must read as "this is what you would see on the patient", not as part of the skull.
6. **"Most used joint in the body" (segment 1).** Standard teaching — the TMJ works in speaking, chewing, and swallowing, thousands of times a day. It is a qualitative claim, not a measured count; the narration states it as a teaching claim.
7. **"The mandible's weak point" (segment 2).** The condylar neck is a common fracture site of the mandible. The narration avoids the superlative "commonest site" — the key facts say "a common fracture site". (Condylar fractures are among the most frequent mandibular fractures in most series, but the ranking varies by study, so the script does not assert it.)
8. **Battle's sign predictive value (segment 7).** The classic literature (Alter et al., 1974) put it at essentially 100%; modern sources say "highly predictive". The narration says "highly predictive" only in the key facts — the on-screen text does not give a number.
9. **The halo sign (segment 8).** A double ring when bloody fluid is dripped on paper suggests CSF mixed with blood, but it is NOT specific — saline, tears, and other fluids produce the same pattern. The key facts state this; the narration does not mention the halo sign (it is a bedside test, not an anatomical structure).
10. **Le Fort lines in real patients are rarely textbook-perfect.** The three patterns are idealised; real midface fractures are often mixed or incomplete. The script presents the classic patterns as Le Fort described them — the reference table and Clinical Point 2 state the idealisation. The narration does not claim every fracture follows these lines exactly.
11. **Durations are estimates.** Word counts assume ~3.0 words/sec (Episode 2 measured ~3.3 words/sec). Measure the real TTS durations for each segment before locking windows, exactly as in Episodes 1–2 (window = narration + 0.6 s).

---

## Sources

- StatPearls — Le Fort Fractures. https://www.statpearls.com/articlelibrary/viewarticle/24122/
- StatPearls — Basilar Skull Fractures. https://www.statpearls.com/point-of-care/18164
- Kenhub — Temporomandibular joint (TMJ): Anatomy and function. https://staging.kenhub.com/en/library/anatomy/the-temporomandibular-joint
- TeachMeAnatomy — Inferior Alveolar Nerve (course, mandibular canal, mental foramen). https://teachmeanatomy.info/encyclopaedia/i/inferior-alveolar-nerve/
- Wikipedia — Le Fort fracture of skull. https://en.wikipedia.org/wiki/Le_Fort_fracture_of_skull
- Wikipedia — Temporomandibular joint. https://en.wikipedia.org/wiki/Temporomandibular_joint
- Wikipedia — Inferior alveolar nerve. https://en.wikipedia.org/wiki/Inferior_alveolar_nerve
- PMC — Raccoon Eyes (tarsal plate sparing, Battle's sign predictive value). https://pmc.ncbi.nlm.nih.gov/articles/PMC2850869/
- Wikipedia — Basilar skull fracture. https://en.wikipedia.org/wiki/Basilar_skull_fracture?oldid=750792567
- WikEM — Mandible dislocation (anterior most common; condyle in front of the articular eminence). https://wikem.org/w/index.php?title=Mandible_dislocation/pl&
- Musculoskeletal Key — Temporomandibular Joint (fossa, eminence, disc compartments, condyle ~20 × 10 mm). https://musculoskeletalkey.com/temporomandibular-joint-4/
- Anatomy Standard — Temporomandibular joint (TA terms: *articulatio temporomandibularis*, *condylus mandibulae*, *fossa mandibularis*, *tuberculum articulare*, *discus articulationis*). https://www.anatomystandard.com/ossa-et-juncturae/cranium/art-temporomandibularis.html
- Matthews, N. S. — Dislocation of the Temporomandibular Joint (Springer, 2018) via U of T OMFS (anterior dislocation mechanism; most TMJ dislocations bilateral). https://www.utomfs.ca/files/2023/01/Dislocation-of-the-Temporomandibular-Joint-2018.pdf
