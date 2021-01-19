// VARS
const _focus_character = "avitanks";
const _respawn_on_death = true;
const _minimum_healing_threshold = 500;

// CODE
const getNeedsHealingFromParty = () => {
	const needsHealing = [];

	for (const name in get_party()) {
		const ally = get_player(name);
		if (!ally) continue;

		const missingLife = ally.max_hp - ally.hp;
		if (missingLife < _minimum_healing_threshold) {
			continue;
		}

		needsHealing.push(ally);
	}

	return needsHealing.sort((a, b) => (a.hp / a.max_hp) - (b.hp / b.max_hp));
};

setInterval(() => {
	if (character.rip) {
		if (_respawn_on_death) {
			respawn();
		}
		
		return;
	}
	
	use_hp_or_mp();
	loot();

	if (is_moving(character)) return;
	
	const focus = get_player(_focus_character);
	if (!is_moving(character) && !get_target() && !is_in_range(focus)) {
		smart_move(focus)
	}
	
	const needsHealing = getNeedsHealingFromParty();
	
	if (needsHealing.length === 0) {
		set_message("Attacking");
		const tank = get_player(_focus_character);
		if (!tank) return;
				
		const tankTarget = get_target_of(tank);
		if (!tankTarget || !is_monster(tankTarget)) {
			const inRange = parent.distance(character, tank) < 100;
			if (!inRange) {
				xmove(
					character.x + (tank.going_x - character.x) / 2,
					character.y + (tank.going_y - character.y) / 2
				);
			}
		} else {
			const inRange = is_in_range(tankTarget);
			if (!inRange) {
				xmove(
					character.x + (tankTarget.going_x - character.x) / 2,
					character.y + (tankTarget.going_y - character.y) / 2
				);
			}

			if (inRange && can_attack(tankTarget)) {
				set_message("Attacking")
				attack(tankTarget);
			}
		}
	} else {
		set_message("Healing");
		if (needsHealing.length === 1 || is_on_cooldown("pheal")) {
			const ally = needsHealing[0];
			const inRange = is_in_range(ally, G.skills.heal);
			if (!inRange) {
				xmove(
					character.x + (ally.going_x - character.x) / 2,
					character.y + (ally.going_y - character.y) / 2
				);
			}
			
			if (inRange && can_heal(ally)) {
				log(`Healing ${ally.name}`);
				heal(ally);
			}
		} else {
			log(`Healing the party`);
			if (!is_on_cooldown("pheal")) use_skill("pheal");
		}

		
	}
}, 1000 / 4);
