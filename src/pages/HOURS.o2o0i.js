import { getEmployees } from 'backend/timesheet.web';
import wixLocationFrontend from 'wix-location-frontend';

$w.onReady(async function () {
  try {
    $w('#employeeRepeater').onItemReady(($item, itemData) => {
      $item('#employeeName').text = itemData.name;

      $item('#employeeName').onClick(() => {
        wixLocationFrontend.to(
          `/employee-hours?employee=${encodeURIComponent(itemData.name)}`
        );
      });
    });

    const employees = await getEmployees();

    console.log('Employees from Google:', employees);

    $w('#employeeRepeater').data = employees.map((employee, index) => ({
      _id: String(index + 1),
      name: employee.name
    }));

  } catch (error) {
    console.error('Employee load error:', error);
  }
});