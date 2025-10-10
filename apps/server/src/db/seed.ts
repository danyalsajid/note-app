import { hierarchyNodes, hierarchyClosure, notes, users } from "./schema.ts";

function getSeedUsers() {
	return [
		{
			id: "user-1",
			username: "admin",
			password: "$2b$10$oTT/NBnCnex7rgma0nAp/ug8dSuwDRwUB93JQQxLlGDCOHNYnYp.C", // password: Test@123
			email: "admin@healthcare.com",
			name: "Admin",
			role: "admin",
			createdAt: new Date().toISOString()
		},
		{
			id: "user-2",
			username: "clinician",
			password: "$2b$10$oTT/NBnCnex7rgma0nAp/ug8dSuwDRwUB93JQQxLlGDCOHNYnYp.C", // password: Test@123
			email: "clinician@healthcare.com",
			name: "Clinician",
			role: "clinician",
			createdAt: new Date().toISOString()
		}
	];
}

function getSeedHierarchyNodes() {
	// Scaled automated data generation
	const organizations: Array<{id: string, type: string, name: string, createdAt: string, updatedAt: string}> = [];
	const organizationTypes = ["General Hospital", "Medical Center", "Health Clinic", "Care Facility", "Specialty Center"];
	const organizationPrefixes = ["Metro", "Regional", "City", "County", "State", "Central"];

	// Generate 6 organizations
	for (let i = 1; i <= 6; i++) {
		const prefix = organizationPrefixes[(i-1) % organizationPrefixes.length];
		const type = organizationTypes[(i-1) % organizationTypes.length];
		organizations.push({
			id: `org-${i}`,
			type: "organisation",
			name: `${prefix} ${type}`,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		});
	}

	const teams: Array<{id: string, type: string, name: string, createdAt: string, updatedAt: string}> = [];
	const teamTypes = ["Emergency", "Cardiology", "Pediatrics", "Surgery", "Radiology", "Neurology", "Orthopedics", "Oncology"];
	const teamSuffixes = ["Department", "Unit", "Division", "Team", "Service", "Center"];

	let teamIndex = 1;

	// Each organization gets 2-3 teams
	organizations.forEach((_org) => {
		const teamsPerOrg = Math.random() < 0.5 ? 2 : 3; // 50% chance for 2 or 3 teams

		for (let i = 0; i < teamsPerOrg; i++) {
			const type = teamTypes[(teamIndex-1) % teamTypes.length];
			const suffix = teamSuffixes[(teamIndex-1) % teamSuffixes.length];
			teams.push({
				id: `team-${teamIndex}`,
				type: "team",
				name: `${type} ${suffix}`,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString()
			});
			teamIndex++;
		}
	});

	const clients: Array<{id: string, type: string, name: string, createdAt: string, updatedAt: string}> = [];
	const firstNames = ["John", "Jane", "Michael", "Sarah", "David", "Lisa", "Robert", "Emily", "James", "Maria", "William", "Jessica", "Richard", "Amanda", "Charles", "Michelle"];
	const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas"];

	let clientIndex = 1;

	// Each team gets 4-5 clients
	teams.forEach((_team) => {
		const clientsPerTeam = Math.random() < 0.5 ? 4 : 5; // 50% chance for 4 or 5 clients

		for (let i = 0; i < clientsPerTeam; i++) {
			const firstName = firstNames[(clientIndex-1) % firstNames.length];
			const lastName = lastNames[(clientIndex-1) % lastNames.length];
			clients.push({
				id: `client-${clientIndex}`,
				type: "client",
				name: `${firstName} ${lastName}`,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString()
			});
			clientIndex++;
		}
	});

	const episodes: Array<{id: string, type: string, name: string, createdAt: string, updatedAt: string}> = [];
	const episodeTypes = ["Consultation", "Assessment", "Checkup", "Examination", "Treatment", "Follow-up", "Screening", "Procedure"];

	let episodeIndex = 1;

	// Each client gets 3-4 episodes
	clients.forEach((_client) => {
		const episodesPerClient = Math.random() < 0.5 ? 3 : 4; // 50% chance for 3 or 4 episodes

		for (let i = 0; i < episodesPerClient; i++) {
			const type = episodeTypes[(episodeIndex-1) % episodeTypes.length];
			episodes.push({
				id: `episode-${episodeIndex}`,
				type: "episode",
				name: `${type} Session`,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString()
			});
			episodeIndex++;
		}
	});

	console.log(`Generated: ${organizations.length} orgs, ${teams.length} teams, ${clients.length} clients, ${episodes.length} episodes`);

	return [...organizations, ...teams, ...clients, ...episodes];
}

function getSeedClosureRelationships() {
	const relationships: Array<{ancestor: string, descendant: string, depth: number}> = [];

	// Get all entities that were generated
	const allEntities = getSeedHierarchyNodes();
	const organizations = allEntities.filter(e => e.type === "organisation");
	const teams = allEntities.filter(e => e.type === "team");
	const clients = allEntities.filter(e => e.type === "client");
	const episodes = allEntities.filter(e => e.type === "episode");

	// Self-references (depth 0) - every node references itself
	allEntities.forEach(entity => {
		relationships.push({ ancestor: entity.id, descendant: entity.id, depth: 0 });
	});

	// Generate hierarchical relationships dynamically
	let teamIndex = 0;
	let clientIndex = 0;
	let episodeIndex = 0;

	// Organizations -> Teams (each org gets teams assigned)
	organizations.forEach(org => {
		const teamsPerOrg = Math.floor(teams.length / organizations.length) + (teams.length % organizations.length > organizations.indexOf(org) ? 1 : 0);

		for (let i = 0; i < teamsPerOrg && teamIndex < teams.length; i++) {
			const team = teams[teamIndex];
			if (team) {
				relationships.push({ ancestor: org.id, descendant: team.id, depth: 1 });
			}
			teamIndex++;
		}
	});

	// Teams -> Clients (each team gets clients assigned)
	teams.forEach(team => {
		const clientsPerTeam = Math.floor(clients.length / teams.length) + (clients.length % teams.length > teams.indexOf(team) ? 1 : 0);

		for (let i = 0; i < clientsPerTeam && clientIndex < clients.length; i++) {
			const client = clients[clientIndex];
			if (client) {
				relationships.push({ ancestor: team.id, descendant: client.id, depth: 1 });
			}
			clientIndex++;
		}
	});

	// Clients -> Episodes (each client gets episodes assigned)
	clients.forEach(client => {
		const episodesPerClient = Math.floor(episodes.length / clients.length) + (episodes.length % clients.length > clients.indexOf(client) ? 1 : 0);

		for (let i = 0; i < episodesPerClient && episodeIndex < episodes.length; i++) {
			const episode = episodes[episodeIndex];
			if (episode) {
				relationships.push({ ancestor: client.id, descendant: episode.id, depth: 1 });
			}
			episodeIndex++;
		}
	});

	// Generate transitive relationships (depth 2+)
	// Find all depth 1 relationships to calculate transitive ones
	const depth1Rels = relationships.filter(r => r.depth === 1);

	// For each pair of depth 1 relationships, if A->B and B->C, then A->C
	for (const rel1 of depth1Rels) {
		for (const rel2 of depth1Rels) {
			if (rel1.descendant === rel2.ancestor && rel1.ancestor !== rel2.descendant) {
				const existingRel = relationships.find(r =>
					r.ancestor === rel1.ancestor && r.descendant === rel2.descendant
				);

				if (!existingRel) {
					const depth = Math.max(rel1.depth, rel2.depth) + 1;
					relationships.push({
						ancestor: rel1.ancestor,
						descendant: rel2.descendant,
						depth: Math.min(depth, 3) // Cap at depth 3
					});
				}
			}
		}
	}

	return relationships;
}

function getSeedNotes() {
	const notes: Array<{id: string, content: string, attachedToId: string, attachedToType: string, tags: string, createdAt: string, updatedAt: string}> = [];

	// Get all entities that were generated
	const allEntities = getSeedHierarchyNodes();

	// Generate 3-4 notes for each entity
	allEntities.forEach((entity, index) => {
		if (!entity.type || !entity.id) return;

		const notesPerEntity = Math.random() < 0.5 ? 3 : 4; // 50% chance for 3 or 4 notes

		for (let noteIndex = 0; noteIndex < notesPerEntity; noteIndex++) {
			const noteId = `note-${index * 4 + noteIndex + 1}`;

			// Generate random content based on entity type
			let content = "";
			switch (entity.type) {
				case "organisation": {
					const orgContents = [
						`Administrative updates completed for ${entity.name}.`,
						`Patient discharge procedures updated at ${entity.name}.`,
						`Operational protocols revised at ${entity.name}.`,
						`Quality metrics reviewed and analyzed for ${entity.name}.`,
						`Strategic planning session conducted at ${entity.name}.`
					];
					content = orgContents[noteIndex % orgContents.length] || `Default content for ${entity.type}`;
					break;
				}
				case "team": {
					const teamContents = [
						`Department meeting scheduled for ${entity.name}.`,
						`Protocol updated for improved efficiency in ${entity.name}.`,
						`Training session organized for ${entity.name} staff.`,
						`Quality improvement initiatives implemented in ${entity.name}.`,
						`Resource allocation reviewed for ${entity.name}.`
					];
					content = teamContents[noteIndex % teamContents.length] || `Default content for ${entity.type}`;
					break;
				}
				case "client": {
					const clientContents = [
						`Patient education provided for ${entity.name}.`,
						`Patient reports improvement in condition for ${entity.name}.`,
						`Medical intervention administered for ${entity.name}.`,
						`Health indicators within normal range for ${entity.name}.`,
						`Care plan adjusted for ${entity.name}.`
					];
					content = clientContents[noteIndex % clientContents.length] || `Default content for ${entity.type}`;
					break;
				}
				case "episode": {
					const episodeContents = [
						`Patient presents with symptoms requiring assessment for ${entity.name}.`,
						`Medical intervention completed successfully for ${entity.name}.`,
						`Follow-up care scheduled for ${entity.name}.`,
						`Diagnostic examination completed for ${entity.name}.`,
						`Treatment plan initiated for ${entity.name}.`
					];
					content = episodeContents[noteIndex % episodeContents.length] || `Default content for ${entity.type}`;
					break;
				}
				default:
					content = `Default content for ${entity.type} ${entity.id}`;
			}

			// Generate random tags
			const tagOptions = ["Urgent", "Assessment", "Follow-up", "Medication", "Treatment", "Review"];
			const numTags = Math.floor(Math.random() * 3) + 1; // 1-3 tags
			const randomTags: string[] = [];
			for (let i = 0; i < numTags; i++) {
				const randomIndex = Math.floor(Math.random() * tagOptions.length);
				const randomTag = tagOptions[randomIndex];
				if (randomTag && !randomTags.includes(randomTag)) {
					randomTags.push(randomTag);
				}
			}

			// Generate a valid date within January 2024
			const dayOffset = (index * 4 + noteIndex) % 31 + 1; // Valid days 1-31
			const hour = 8 + (index * 4 + noteIndex) % 12; // Hours 8-19
			const minute = (index * 4 + noteIndex) % 60; // Minutes 0-59

			notes.push({
				id: noteId,
				content,
				attachedToId: entity.id,
				attachedToType: entity.type,
				tags: JSON.stringify(randomTags),
				createdAt: new Date(`2024-01-${String(dayOffset).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00.000Z`).toISOString(),
				updatedAt: new Date(`2024-01-${String(dayOffset).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00.000Z`).toISOString()
			});
		}
	});

	console.log(`Generated ${notes.length} notes for ${allEntities.length} entities`);

	return notes;
}

// Seed database with initial data using bulk inserts
async function seedDatabase(db: any) {
	console.log("Seeding database with initial data");

	try {
		// insert users
		console.log("Creating users");
		const seedUsers = getSeedUsers();
		await db.insert(users).values(seedUsers).onConflictDoNothing();

		// insert hierarchy nodes
		console.log("Creating hierarchy nodes");
		const seedHierarchyNodes = getSeedHierarchyNodes();
		await db.insert(hierarchyNodes).values(seedHierarchyNodes).onConflictDoNothing();

		// insert notes
		console.log("Creating notes");
		const seedNotes = getSeedNotes();
		await db.insert(notes).values(seedNotes).onConflictDoNothing();

		// insert closure relationships
		console.log("Creating hierarchy relationships");
		const seedClosureRelationships = getSeedClosureRelationships();
		await db.insert(hierarchyClosure).values(seedClosureRelationships).onConflictDoNothing();

	} catch (error) {
		console.error("Error seeding database:", error);
		throw error;
	}
}

export { seedDatabase };
