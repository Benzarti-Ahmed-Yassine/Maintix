from tests.simulation.industrial_scenario import IndustrialSimulation


def test_industrial_simulation_generates_realistic_events() -> None:
    simulation = IndustrialSimulation(seed=11)
    events = simulation.run(count=4)

    assert len(events) == 4
    assert events[0]['asset_id'] == 100
    assert events[0]['recommended_action'] in {'dispatch maintenance crew', 'monitor and recheck'}
    assert all('asset_id' in event for event in events)
