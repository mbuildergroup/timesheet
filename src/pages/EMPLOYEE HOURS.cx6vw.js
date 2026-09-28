import wixLocationFrontend from 'wix-location-frontend';
import { getEmployees, getEmployeeHours } from 'backend/timesheet.web';

let selectionNumber = 0;

$w.onReady(async function () {
  $w('#employeeHoursSection').collapse();

  $w('#employeeRepeater').onItemReady(($item, itemData) => {
    $item('#employeeName').text = itemData.name;
    $item('#employeeName').onClick(() => showEmployeeHours(itemData.name));
  });

  try {
    const employees = await getEmployees();
    $w('#employeeRepeater').data = employees.map((employee, index) => ({
      _id: String(index + 1),
      name: employee.name
    }));

    const selectedName = wixLocationFrontend.query.employee;
    if (selectedName) {
      await showEmployeeHours(selectedName);
    }
  } catch (error) {
    console.error('Employee list load error:', error);
    $w('#employeeHoursSection').expand();
    showError('Ажилтнуудын жагсаалт уншихад алдаа гарлаа.');
  }
});

async function showEmployeeHours(employeeName) {
  const currentSelection = ++selectionNumber;
  $w('#employeeTitle').text = employeeName;
  $w('#employeeHoursSection').expand();
  setLoadingState();

  try {
    const data = await getEmployeeHours(employeeName);
    if (currentSelection !== selectionNumber) return;

    renderPayPeriod(data);
    renderHours(data);
    renderTotals(data);

    $w('#statusText').text = '';
    $w('#hoursRepeater').show();
    $w('#payPeriodText').show();
    $w('#week1TotalText').show();
    $w('#week2TotalText').show();
    $w('#periodTotalText').show();
  } catch (error) {
    if (currentSelection !== selectionNumber) return;
    console.error('Employee hours load error:', error);
    showError('Цагийн мэдээлэл уншихад алдаа гарлаа.');
  }
}

function setLoadingState() {
  $w('#statusText').text = 'Loading...';
  $w('#hoursRepeater').hide();
  $w('#payPeriodText').hide();
  $w('#week1TotalText').hide();
  $w('#week2TotalText').hide();
  $w('#periodTotalText').hide();
}

function showError(message) {
  $w('#statusText').text = message;
  $w('#hoursRepeater').hide();
  $w('#payPeriodText').hide();
  $w('#week1TotalText').hide();
  $w('#week2TotalText').hide();
  $w('#periodTotalText').hide();
}

function renderPayPeriod(data) {
  const start =
    data.periodStart ||
    data.start ||
    data.period?.start ||
    '';

  const end =
    data.periodEnd ||
    data.end ||
    data.period?.end ||
    '';

  if (start && end) {
    $w('#payPeriodText').text =
      `${formatDate(start)} - ${formatDate(end)}`;
  } else {
    $w('#payPeriodText').text = '';
  }
}


function renderHours(data) {
  const rows = [];

  const weeks = Array.isArray(data.weeks)
    ? data.weeks
    : [];

  weeks.forEach((week) => {
    const days = Array.isArray(week.days)
      ? week.days
      : [];

    days.forEach((day) => {
      const entries =
        day.entries ||
        day.records ||
        day.items ||
        [];

      if (Array.isArray(entries) && entries.length > 0) {
        entries.forEach((entry) => {
          rows.push(
            makeRow(day, entry, rows.length)
          );
        });
      } else {
        rows.push(
          makeRow(day, day, rows.length)
        );
      }
    });
  });

  $w('#hoursRepeater').onItemReady(($item, itemData) => {
    $item('#dateText').text = itemData.date;
    $item('#siteText').text = itemData.site;
    $item('#timeText').text = itemData.time;
    $item('#hoursText').text = itemData.hours;
  });

  $w('#hoursRepeater').data = rows;
}


function makeRow(day, entry, index) {
  const status =
    entry.status ||
    day.status ||
    '';

  const date =
    entry.date ||
    day.date ||
    day.day ||
    '';

  const site =
    entry.site ||
    entry.siteName ||
    entry.jobSite ||
    day.site ||
    day.siteName ||
    '';

  const begin =
    entry.begin ||
    entry.start ||
    entry.startTime ||
    day.begin ||
    day.start ||
    '';

  const finish =
    entry.finish ||
    entry.end ||
    entry.endTime ||
    day.finish ||
    day.end ||
    '';

  const hours =
    entry.hours ??
    day.hours ??
    '';

  let siteText = site || status || 'NO ENTRY';
  let timeText = '';
  let hoursText = '';

  if (entry.off === true || status === 'OFF') {
    siteText = 'OFF';
    timeText = '';
    hoursText = '0 hrs';

  } else if (
    status === 'NO_ENTRY' ||
    status === 'NO ENTRY'
  ) {
    siteText = 'NO ENTRY';
    timeText = '';
    hoursText = '';

  } else {
    if (begin || finish) {
      timeText =
        `${begin || ''}${begin && finish ? ' - ' : ''}${finish || ''}`;
    }

    if (hours !== '' && hours !== null && hours !== undefined) {
      hoursText = `${hours} hrs`;
    }
  }

  return {
    _id: String(index + 1),
    date: formatDate(date),
    site: siteText,
    time: timeText,
    hours: hoursText
  };
}


function renderTotals(data) {
  const weeks = Array.isArray(data.weeks)
    ? data.weeks
    : [];

  const week1 = weeks[0];
  const week2 = weeks[1];

  const week1Total = getWeekTotal(week1);
  const week2Total = getWeekTotal(week2);

  const periodTotal =
    data.periodTotal ??
    data.totalHours ??
    data.total ??
    '';

  $w('#week1TotalText').text =
    `Week 1: ${formatHours(week1Total)}`;

  $w('#week2TotalText').text =
    `Week 2: ${formatHours(week2Total)}`;

  $w('#periodTotalText').text =
    `Pay Period Total: ${formatHours(periodTotal)}`;
}


function getWeekTotal(week) {
  if (!week) {
    return 0;
  }

  return (
    week.weekTotal ??
    week.totalHours ??
    week.total ??
    0
  );
}


function formatHours(value) {
  if (
    value === '' ||
    value === null ||
    value === undefined
  ) {
    return '0 hrs';
  }

  return `${value} hrs`;
}


function formatDate(value) {
  if (!value) {
    return '';
  }

  const text = String(value);

  const match = text.match(
    /^(\d{4})-(\d{2})-(\d{2})/
  );

  if (match) {
    return `${match[2]}/${match[3]}/${match[1]}`;
  }

  return text;
}