// VARS
const _focus_character = "aviswings";
const _respawn_on_death = true;

// CODE
const getNeedsHealingFromParty = (healingThreshold = character.attack * 2) => {
	const needsHealing = [];
			
	for (const name in get_party()) {
		const ally = get_player(name);
		if (!ally) continue;
		
		const missingLife = ally.max_hp - ally.hp;
		if (missingLife < healingThreshold) continue;
		
		needsHealing.push(ally);
	}
	
	return needsHealing;
}

setInterval(() => {
	if (character.rip) {
		if (_respawn_on_death) {
			respawn()
		}
		
		return;
	}
	
	use_hp_or_mp();
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
				move(
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
				set_message("Healing")
				heal(ally);
			}
		});
	}
}, 1000 / 4);
