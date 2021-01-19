// VARS
const _healer_character = "aviheals";
const _use_party_target = false;
const _respawn_on_death = true;
const _target_fallback_options = { min_xp: 400, max_att: 120 };
const _first_target = { x: 613, y: 748 };

// CODE
const getRandomTargetFromParty = () => {
	const party = Object.entries(get_party());
	const notMe = party.filter(p => p[0] !== character.name);
	if (notMe.length === 0) return;
	
	const random = notMe[Math.floor(Math.random() * notMe.length)];
	const partyMember = get_player(random[0]);
	const partyMemberTarget = get_target_of(partyMember);
	
	return partyMemberTarget;
}

const getEnemyTarget = () => {
	const targeted = get_targeted_monster();
	if (targeted) return targeted;
	
	if (_use_party_target) {
		const partyTarget =	getRandomTargetFromParty();
		if (partyTarget) return partyTarget;
	}
	
	const fallback = get_nearest_monster(_target_fallback_options); 
	if (fallback) return fallback;
}

let waitingForPartner = true;

setInterval(() => {
	if (character.rip) {
		if (_respawn_on_death) {
			respawn();
			
			while (waitingForPartner) {
				const partner = get_player(_healer_character);
				const inRange = parent.distance(character, partner) < 300;

				if (inRange) {
					log(`${partner.name} is here, let's go.`);
					smart_move(_first_target.x, _first_target.y);
					waitingForPartner = false;
					break;
				}
			}
		}
		
		return;
	}	
	
	use_hp_or_mp();	
	loot();

	if(is_moving(character)) return;
	
	const healer = get_player(_healer_character);
	if (
		!is_moving(character) 
		&& !get_target() 
		&& healer 
		&& parent.distance(character, healer) > 300
	) {
		log("We got lost, meeting back up at first target.");
		smart_move(_first_target.x, _first_target.y);
	}

	const target = getEnemyTarget();
	
	if (!is_in_range(target)) {
		if (
			!is_on_cooldown("charge")
			&& character.mp >= G.skills.charge.mp
		) {
			log("Charge!");
			use_skill("charge");
		}	
		
		// Walk half the distance
		xmove(
			character.x + (target.x - character.x) / 2,
			character.y + (target.y - character.y) / 2
		);
	} else if (can_attack(target)) {
		set_message(`Attacking`);
		attack(target);
	}
}, 1000 / 4);
