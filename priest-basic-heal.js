// VARS
const _focus_character = "avitanks";
const _respawn_on_death = true;
const _minimum_healing_threshold = character.attack * 2;

// CODE
const getNeedsHealingFromParty =
	(healingThreshold = _minimum_healing_threshold) => {
		const needsHealing = [];

		for (const name in get_party()) {
			const ally = get_player(name);
			if (!ally) continue;

			const missingLife = ally.max_hp - ally.hp;
			if (missingLife < healingThreshold) continue;

			needsHealing.push(ally);
		}

		return needsHealing;
	};

const manage_hp_and_mp = () => {
	if (mssince(new Date(get("last_potion"))) < 600) return;
	
	let used = false;
		
	if (character.hp < character.max_hp * 0.4) {
		if (!is_on_cooldown("use_hp")) {
			log("Drinking HP Potion!");
			use_skill("use_hp");
			used = true;
		}
	} else if (character.hp < character.max_hp) {
		if (!is_on_cooldown("regen_hp")) {
			use_skill("regen_hp");
			used = true;
		}
	}
	
	if (character.mp < character.max_mp * 0.5) {
		if (!is_on_cooldown("use_mp")) {
			log("Drinking MP Potion!");
			use_skill('use_mp'); 
			used = true;
		}
	} else if (character.mp < character.max_mp) {
		if (!is_on_cooldown("regen_mp")) {
			use_skill("regen_mp");
			used = true;
		}
	}
	
	if (used) set("last_potion", new Date().getTime());
};

setInterval(() => {
	if (character.rip) {
		if (_respawn_on_death) {
			respawn();
		}
		
		return;
	}
	
	manage_hp_and_mp();
	loot();

	if (is_moving(character)) return;
	
	const needsHealing = getNeedsHealingFromParty();
	
	if (needsHealing.length === 0) {
		const tank = get_player(_focus_character);
		if (!tank) return;
				
		const tankTarget = get_target_of(tank);
		if (!tankTarget || !is_monster(tankTarget)) {
			const inRange = parent.distance(character, tank) > 100;
			if (!inRange) {
				xmove(
					character.x + (tank.x - character.x) / 2,
					character.y + (tank.y - character.y) / 2
				);
			}
		} else {
			const inRange = is_in_range(tankTarget);
			if (!inRange) {
				xmove(
					character.x + (tankTarget.x - character.x) / 2,
					character.y + (tankTarget.y - character.y) / 2
				);
			}

			if (inRange && can_attack(tankTarget)) {
				set_message("Attacking")
				attack(tankTarget);
			}
		}
	} else {
		needsHealing.forEach((ally) => {
			const inRange = is_in_range(ally, G.skills.heal);
			if (!inRange) {
				xmove(
					character.x + (ally.x - character.x) / 2,
					character.y + (ally.y - character.y) / 2
				);
			}
			
			if (inRange && can_heal(ally)) {
				log(`Healing ${ally.name}`);
				set_message("Healing");
				heal(ally);
			}
		});
	}
}, 1000 / 4);
